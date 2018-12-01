export class Plain {
  public plain: string;

  constructor(plain: string) {
    this.plain = plain;
  }
}

export class Price {
  public priceNew: number;
  public url: string;
  public shop: Shop;

  constructor(priceNew: number,  url: string, shop: Shop) {
    this.priceNew = priceNew;
    this.url = url;
    this.shop = shop;
  }
}

export class Shop {
  public id: string;
  public name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
