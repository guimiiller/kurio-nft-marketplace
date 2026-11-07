export interface NFT {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  network: string;
  available: number;
  version: number;
}

export const nfts: NFT[] = [
  {
    id: "1",
    name: "Emerald Ape #042",
    price: "1.19",
    image: "/images/emerald-ape.png",
    category: "Arte digital",
    network: "Ethereum",
    available: 5,
    version: 1,
  },
  {
    id: "2",
    name: "Sage Nomad #009",
    price: "1.69",
    image: "/images/sage-nomad.png",
    category: "Colecionáveis",
    network: "Ethereum",
    available: 3,
    version: 1,
  },
  {
    id: "3",
    name: "Neon Vessel #552",
    price: "1.99",
    image: "/images/neon-vessel.png",
    category: "Arte digital",
    network: "Polygon",
    available: 2,
    version: 1,
  },
];
