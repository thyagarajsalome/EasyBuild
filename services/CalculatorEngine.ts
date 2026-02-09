
import { CalculatorState, CalculationResult, QualityType } from '../types';
import { RATES } from '../constants';

/**
 * Strategy pattern implementation for construction cost logic.
 * This separates business rules from UI components.
 */
export class CalculatorEngine {
  static calculate(state: CalculatorState): CalculationResult {
    // Determine the rate to use for civil work: custom or preset
    const civilRate = (state.civil.customRate && state.civil.customRate > 0)
      ? state.civil.customRate
      : RATES.CIVIL[state.civil.quality];

    const civilWork = state.civil.area * civilRate * state.civil.floors;
    const painting = state.painting.area * RATES.PAINTING[state.painting.quality];
    const flooring = state.flooring.area * RATES.FLOORING[state.flooring.material];
    const electrical = state.civil.area * RATES.ELECTRICAL;
    const plumbing = (state.plumbing.toilets * RATES.PLUMBING.TOILET) + (state.plumbing.kitchens * RATES.PLUMBING.KITCHEN);
    const doorsWindows = (state.doorsWindows.doors * RATES.DOORS_WINDOWS.DOOR) + (state.doorsWindows.windows * RATES.DOORS_WINDOWS.WINDOW);

    return {
      civilWork,
      painting,
      flooring,
      electrical,
      plumbing,
      doorsWindows,
      total: civilWork + painting + flooring + electrical + plumbing + doorsWindows
    };
  }

  static getAreaBasedOnCivil(civilArea: number): Partial<CalculatorState> {
    // Helper to auto-fill common assumptions in Indian construction
    return {
      painting: { area: civilArea * 3.5, quality: QualityType.STANDARD },
      flooring: { area: civilArea * 0.9, material: 'VITRIFIED' }
    };
  }
}
