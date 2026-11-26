import { summarizeTimeSeriesValue } from './time-series-summary.directive';

describe('summarizeTimeSeriesValue', () => {
    it('averages a numeric array when the directive is avg', () => {
        expect(summarizeTimeSeriesValue([1, 2, 3], 'avg')).toBe('2');
    });

    it('sums a numeric array when the directive is sum', () => {
        expect(summarizeTimeSeriesValue([1, 2, 3], 'sum')).toBe('6');
    });

    it('preserves the value when it is not a non-empty numeric array', () => {
        expect(summarizeTimeSeriesValue([1, '2'], 'sum')).toBe('1,2');
        expect(summarizeTimeSeriesValue(4, 'avg')).toBe('4');
        expect(summarizeTimeSeriesValue([], 'sum')).toBe('');
    });
});
