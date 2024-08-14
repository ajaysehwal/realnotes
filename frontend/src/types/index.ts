export interface User {
  uid: string;
  email: string;
}
export interface Note {
  id?: string;
  title: string;
  content: string;
  lastModified: Date;
  createdAt?: number;
  updatedAt?: number;
}
