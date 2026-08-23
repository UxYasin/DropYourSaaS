import { type Paddle, type PricePreviewParams, type PricePreviewResponse } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { SPONSOR_TIERS } from '@/lib/sponsor-tiers';

export type PaddlePricesMap = Record<string, string>;

export function usePaddlePrices(
  paddle: Paddle | undefined | null,
  country?: string
): { prices: PaddlePricesMap; loading: boolean } {
  const [prices, setPrices] = useState<PaddlePricesMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paddle) return;

    const items = SPONSOR_TIERS.map((tier) => ({
      priceId: tier.priceId,
      quantity: 1,
    }));

    // If country is valid (2-letter ISO), pass address. Never pass 'OTHERS' or unknown sentinels.
    const isCountryValid = country && country.length === 2 && country !== 'OTHERS';

    const params: Partial<PricePreviewParams> = {
      items,
      ...(isCountryValid ? { address: { countryCode: country } } : {}),
    };

    setLoading(true);
    paddle
      .PricePreview(params as PricePreviewParams)
      .then((response: PricePreviewResponse) => {
        if (response?.data?.details?.lineItems) {
          const map: PaddlePricesMap = {};
          response.data.details.lineItems.forEach((item) => {
            if (item?.price?.id && item?.formattedTotals?.total) {
              map[item.price.id] = item.formattedTotals.total;
            }
          });
          setPrices(map);
        }
      })
      .catch((err) => {
        console.warn('Paddle PricePreview notice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [country, paddle]);

  return { prices, loading };
}
