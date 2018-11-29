import { ItadApi } from '../api/itad-api';

const itadApi = new ItadApi('NO KEY');
jest.mock('../api/http');

describe('ItadAPI', () => {
  test('basic', () => {
    const pricingInfoForAppId = itadApi.getPricingInfoForAppId( 275850);

    pricingInfoForAppId.subscribe((res) => {
      expect(res.length).toBe(2)
    })
  });
});
