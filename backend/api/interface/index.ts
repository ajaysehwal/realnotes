export interface Note {
    id?: string;
    userId: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  }
export interface User {
    uid: string;
    email: string;
  }