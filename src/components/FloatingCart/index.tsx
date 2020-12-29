import React, { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  Container,
  CartPricing,
  CartButton,
  CartButtonText,
  CartTotalPrice,
  ActitivityContainer,
} from './styles';

import formatValue from '../../utils/formatValue';

import { useCart } from '../../hooks/cart';

const FloatingCart: React.FC = () => {
  const { products } = useCart();

  const navigation = useNavigation();

  const cartTotal = useMemo(() => {
    if (products.length > 0) {
      const allProductsPrice: number[] = [];

      products.forEach(product => {
        allProductsPrice.push(product.price * product.quantity);
      });

      const totalPrice = allProductsPrice.reduce((acc, crr) => {
        return acc + crr;
      });

      return formatValue(totalPrice);
    }

    return formatValue(0);
  }, [products]);

  const totalItensInCart = useMemo(() => {
    if (products.length > 0) {
      const allProductsItems: number[] = [];

      products.forEach(product => {
        allProductsItems.push(product.quantity);
      });

      const totalItems = allProductsItems.reduce((acc, crr) => {
        return acc + crr;
      });

      return totalItems;
    }

    return 0;
  }, [products]);

  if (products.length < 0) {
    return (
      <ActitivityContainer>
        <ActivityIndicator size={20} color="#fff" />
      </ActitivityContainer>
    );
  }

  return (
    <Container>
      <CartButton
        testID="navigate-to-cart-button"
        onPress={() => navigation.navigate('Cart')}
      >
        <FeatherIcon name="shopping-cart" size={24} color="#fff" />
        <CartButtonText>{`${totalItensInCart} itens`}</CartButtonText>
      </CartButton>

      <CartPricing>
        <CartTotalPrice>{cartTotal}</CartTotalPrice>
      </CartPricing>
    </Container>
  );
};

export default FloatingCart;
