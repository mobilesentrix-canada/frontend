export interface Store {
  id: string;
  name: string;
  storeId: string;
  memberCount: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  password: string;
  storeId: string;
  storeName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

export interface Order {
  id: string;
  memberId: string;
  memberName: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const mockStores: Store[] = [
  { id: "1", name: "Downtown Store", storeId: "DS001", memberCount: 5 },
  { id: "2", name: "Mall Location", storeId: "ML002", memberCount: 8 },
  { id: "3", name: "Airport Branch", storeId: "AB003", memberCount: 3 },
  { id: "4", name: "Suburban Center", storeId: "SC004", memberCount: 6 },
];

export const mockMembers: Member[] = [
  {
    id: "2",
    name: "John Smith",
    email: "john@store1.com",
    password: "temp123",
    storeId: "1",
    storeName: "Downtown Store",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah@store2.com",
    password: "temp456",
    storeId: "2",
    storeName: "Mall Location",
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    name: "Mike Wilson",
    email: "mike@store1.com",
    password: "temp789",
    storeId: "1",
    storeName: "Downtown Store",
    createdAt: "2024-02-01",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 99.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics",
    stock: 50,
  },
  {
    id: "2",
    name: "Smart Watch",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    description: "Advanced fitness tracking and smart notifications",
    category: "Electronics",
    stock: 30,
  },
  {
    id: "3",
    name: "Coffee Maker",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=300&h=300&fit=crop",
    description: "Programmable coffee maker with thermal carafe",
    category: "Home",
    stock: 25,
  },
  {
    id: "4",
    name: "Yoga Mat",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
    description: "Non-slip yoga mat for all types of practice",
    category: "Fitness",
    stock: 100,
  },
  {
    id: "5",
    name: "Bluetooth Speaker",
    price: 59.99,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
    description: "Portable speaker with excellent sound quality",
    category: "Electronics",
    stock: 40,
  },
  {
    id: "6",
    name: "Desk Lamp",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop",
    description: "LED desk lamp with adjustable brightness",
    category: "Home",
    stock: 60,
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    memberId: "2",
    memberName: "John Smith",
    storeId: "1",
    storeName: "Downtown Store",
    items: [
      {
        productId: "1",
        productName: "Wireless Headphones",
        quantity: 1,
        price: 99.99,
      },
      {
        productId: "3",
        productName: "Coffee Maker",
        quantity: 1,
        price: 79.99,
      },
    ],
    total: 179.98,
    status: "pending",
    createdAt: "2024-03-15T10:30:00Z",
  },
  {
    id: "2",
    memberId: "3",
    memberName: "Sarah Johnson",
    storeId: "2",
    storeName: "Mall Location",
    items: [
      {
        productId: "2",
        productName: "Smart Watch",
        quantity: 1,
        price: 199.99,
      },
    ],
    total: 199.99,
    status: "approved",
    createdAt: "2024-03-14T14:20:00Z",
  },
  {
    id: "3",
    memberId: "2",
    memberName: "John Smith",
    storeId: "1",
    storeName: "Downtown Store",
    items: [
      { productId: "4", productName: "Yoga Mat", quantity: 2, price: 29.99 },
      {
        productId: "5",
        productName: "Bluetooth Speaker",
        quantity: 1,
        price: 59.99,
      },
    ],
    total: 119.97,
    status: "rejected",
    createdAt: "2024-03-13T09:15:00Z",
  },
];

export class MockDataService {
  static stores = [...mockStores];
  static members = [...mockMembers];
  static products = [...mockProducts];
  static orders = [...mockOrders];

  static getStores() {
    return Promise.resolve([...this.stores]);
  }

  static addStore(store: Omit<Store, "id">) {
    const newStore = { ...store, id: Date.now().toString() };
    this.stores.push(newStore);
    return Promise.resolve(newStore);
  }

  static updateStore(id: string, updates: Partial<Store>) {
    const index = this.stores.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.stores[index] = { ...this.stores[index], ...updates };
      return Promise.resolve(this.stores[index]);
    }
    return Promise.reject(new Error("Store not found"));
  }

  static deleteStore(id: string) {
    this.stores = this.stores.filter((s) => s.id !== id);
    return Promise.resolve();
  }

  static getMembers() {
    return Promise.resolve([...this.members]);
  }

  static addMember(member: Omit<Member, "id" | "createdAt">) {
    const newMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    this.members.push(newMember);
    return Promise.resolve(newMember);
  }

  static updateMember(id: string, updates: Partial<Member>) {
    const index = this.members.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.members[index] = { ...this.members[index], ...updates };
      return Promise.resolve(this.members[index]);
    }
    return Promise.reject(new Error("Member not found"));
  }

  static deleteMember(id: string) {
    this.members = this.members.filter((m) => m.id !== id);
    return Promise.resolve();
  }

  static getOrders() {
    return Promise.resolve([...this.orders]);
  }

  static updateOrderStatus(id: string, status: "approved" | "rejected") {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      this.orders[index].status = status;
      return Promise.resolve(this.orders[index]);
    }
    return Promise.reject(new Error("Order not found"));
  }

  static addOrder(order: Omit<Order, "id" | "createdAt">) {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.orders.push(newOrder);
    return Promise.resolve(newOrder);
  }

  static getProducts() {
    return Promise.resolve([...this.products]);
  }
}
