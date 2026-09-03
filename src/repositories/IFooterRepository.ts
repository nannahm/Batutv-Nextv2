import { FooterConfig } from '../types/footer';

export interface IFooterRepository {
  getConfig(): Promise<FooterConfig>;
  saveConfig(config: FooterConfig): Promise<FooterConfig>;
  subscribe(
    onNext: (config: FooterConfig) => void,
    onError?: (error: Error) => void
  ): () => void;
}
