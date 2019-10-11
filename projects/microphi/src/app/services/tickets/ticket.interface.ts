export type User = {
  id: number;
  name: string;
};

export type Ticket = {
  id: number;
  description: string;
  assigneeId: number;
  completed: boolean;
  assignee?: User;
};

export type TicketState = Partial<Ticket> & {loading: boolean, error: any}
