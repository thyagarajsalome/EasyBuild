
export enum QualityType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}

export type CategoryKey = 'civil' | 'painting' | 'flooring' | 'electrical' | 'plumbing' | 'doorsWindows';

export interface BaseInput {
  area: number;
}

export interface ConstructionData extends BaseInput {
  quality: QualityType;
  floors: number;
  customRate?: number;
}

export interface PaintingData extends BaseInput {
  quality: QualityType;
}

export interface FlooringData extends BaseInput {
  material: 'VITRIFIED' | 'MARBLE' | 'GRANITE' | 'WOODEN';
}

export interface ElectricalData extends BaseInput {
  pointsCount: number;
}

export interface PlumbingData {
  toilets: number;
  kitchens: number;
}

export interface DoorsWindowsData {
  doors: number;
  windows: number;
}

export interface CalculatorState {
  civil: ConstructionData;
  painting: PaintingData;
  flooring: FlooringData;
  electrical: ElectricalData;
  plumbing: PlumbingData;
  doorsWindows: DoorsWindowsData;
}

export interface SavedProject {
  id: string;
  name: string;
  timestamp: number;
  state: CalculatorState;
  total: number;
}

export interface CalculationResult {
  civilWork: number;
  painting: number;
  flooring: number;
  electrical: number;
  plumbing: number;
  doorsWindows: number;
  total: number;
}
