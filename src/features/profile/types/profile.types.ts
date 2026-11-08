export interface CollectorProfile {
  userId: string;
  name: string;
  username: string;
  email: string;
  ens: string;
  walletNickname: string;
}

export interface UpdateCollectorProfileInput {
  name: string;
  username: string;
  email: string;
  ens: string;
  walletNickname: string;
}
