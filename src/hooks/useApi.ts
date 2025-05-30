
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';

interface UseApiQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  invalidateQueries?: QueryKey[];
  optimisticUpdate?: {
    queryKey: QueryKey;
    updater: (oldData: any, variables: TVariables) => any;
  };
}

export const useApiQuery = <T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000,
  retry = 3,
  onSuccess,
  onError
}: UseApiQueryOptions<T>) => {
  const { toast } = useToast();

  return useQuery({
    queryKey,
    queryFn: async () => {
     
      try {
        const result = await queryFn();
        
        onSuccess?.(result);
        return result;
      } catch (error) {
        console.error(`API Query Error: ${queryKey.join('/')}`, error);
        const errorMessage = getErrorMessage(error);
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        
        onError?.(error as Error);
        throw error;
      }
    },
    enabled,
    staleTime,
    retry,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useApiMutation = <TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
  optimisticUpdate
}: UseApiMutationOptions<TData, TVariables>) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {

      
      try {
        const result = await mutationFn(variables);
        return result;
      } catch (error) {
        console.error('API Mutation Error:', error);
        throw error;
      }
    },
    onMutate: async (variables) => {

      if (optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: optimisticUpdate.queryKey });
        const previousData = queryClient.getQueryData(optimisticUpdate.queryKey);
        
        queryClient.setQueryData(
          optimisticUpdate.queryKey,
          (oldData: any) => optimisticUpdate.updater(oldData, variables)
        );
        
        return { previousData };
      }
    },
    onSuccess: (data, variables, context) => {

      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      if (optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(optimisticUpdate.queryKey, context.previousData);
      }
      
      const errorMessage = getErrorMessage(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      onError?.(error as Error, variables);
    }
  });
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const simulateNetworkDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));
