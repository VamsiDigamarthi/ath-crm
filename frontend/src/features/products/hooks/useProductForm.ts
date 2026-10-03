import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductSchemaInput, type ProductSchemaOutput } from '../validations/product-schema';
import type { ProductFormData, ProductItem } from '../types/product.types';

const EMPTY: ProductSchemaInput = {
  name: '',
  description: '',
  price: '' as unknown as number,
  unit: 'PER_RETURN',
  taxType: 'NO_TAX',
  status: 'ACTIVE',
};

export const useProductForm = (
  isOpen: boolean,
  item: ProductItem | null,
  onSubmit: (data: ProductFormData) => Promise<boolean>
) => {
  const form = useForm<ProductSchemaInput, unknown, ProductSchemaOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(
      item
        ? {
            name: item.name,
            description: item.description || '',
            price: item.price,
            unit: item.unit,
            taxType: item.taxType,
            status: item.status,
          }
        : EMPTY
    );
  }, [isOpen, item, form]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({ ...values, description: values.description || undefined });
  });

  return { form, submit };
};
