export class Sortable<T> {
  private array: T[];

  constructor(array: T[]) {
    this.array = array;
  }

  public sortByField(key: keyof T, sort: 'asc' | 'desc' = 'asc'): T[] {
    return this.array.sort((a, b) => {
      let i = 0;
      if (a[key] > b[key]) {
        i = 1;
      } else if (b[key] > a[key]) {
        i = -1;
      } else {
        i = 0;
      }

      switch (sort) {
        case 'asc':
          return i;
        case 'desc':
          return i * -1;
      }
    });
  }
}
