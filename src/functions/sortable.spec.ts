import { Sortable } from './sortable';

describe('Sortable', () => {
  describe('string fields', () => {
    let array: TestClass[] = [];
    beforeEach(() => {
      array = [
        new TestClass(1, 'cValue'),
        new TestClass(2, 'aValue'),
        new TestClass(3, 'bValue'),
        new TestClass(4, 'dValue'),
      ];
    });

    it('should sort object by field', () => {
      const sortable = new Sortable(array);
      const sorted = sortable.sortByField('fieldA');
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(3);
      expect(sorted[2].id).toBe(1);
      expect(sorted[3].id).toBe(4);
    });

    it('should sort in reverse if specified', () => {
      const sortable = new Sortable(array);
      const sorted = sortable.sortByField('fieldA', 'desc');
      expect(sorted[0].id).toBe(4);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
      expect(sorted[3].id).toBe(2);
    });
  });

  describe('number fields', () => {
    let array: TestClass[] = [];
    beforeEach(() => {
      array = [
        new TestClass(2, 'aValue'),
        new TestClass(3, 'bValue'),
        new TestClass(1, 'cValue'),
        new TestClass(4, 'dValue'),
      ];
    });

    it('should sort object by field', () => {
      const sortable = new Sortable(array);
      const sorted = sortable.sortByField('id');
      expect(sorted[0].fieldA).toBe('cValue');
      expect(sorted[1].fieldA).toBe('aValue');
      expect(sorted[2].fieldA).toBe('bValue');
      expect(sorted[3].fieldA).toBe('dValue');
    });

    it('should sort in reverse if specified', () => {
      const sortable = new Sortable(array);
      const sorted = sortable.sortByField('id', 'desc');
      expect(sorted[0].fieldA).toBe('dValue');
      expect(sorted[1].fieldA).toBe('bValue');
      expect(sorted[2].fieldA).toBe('aValue');
      expect(sorted[3].fieldA).toBe('cValue');
    });
  });
});

class TestClass {
  public id: number;
  public fieldA: string;

  constructor(id: number, fieldA: string) {
    this.id = id;
    this.fieldA = fieldA;
  }
}
