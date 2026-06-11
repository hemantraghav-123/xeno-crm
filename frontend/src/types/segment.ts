export interface AudienceCustomer {
  id: string;
  name: string;
  email: string;
}

export interface SegmentResponse {
  audienceSize: number;
  audience: AudienceCustomer[];
}
