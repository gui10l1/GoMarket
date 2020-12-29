import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();

      const arrayOfProducts: Product[] = [];
      const storagedKeys = await AsyncStorage.getAllKeys();
      const storagedItems = await AsyncStorage.multiGet(storagedKeys);

      storagedItems.forEach(item => {
        if (item[1]) {
          const parsedData = JSON.parse(item[1]);

          arrayOfProducts.push(parsedData);
        }
      });

      setProducts(arrayOfProducts);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const storagedItem = await AsyncStorage.getItem(
      `@GoMarket:CartItem${product.id}`,
    );

    if (storagedItem) {
      const parsedProduct = JSON.parse(storagedItem);

      const quantity = parsedProduct.quantity + 1;

      const cartProduct = {
        id: product.id,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
        quantity,
      };

      await AsyncStorage.mergeItem(
        `@GoMarket:CartItem${product.id}`,
        JSON.stringify(cartProduct),
      );

      setProducts(states => {
        const updatedState = states.map(state => {
          if (state.id === cartProduct.id) {
            return cartProduct;
          }
          return state;
        });

        return updatedState;
      });

      return;
    }

    const cartProduct = {
      id: product.id,
      title: product.title,
      image_url: product.image_url,
      price: product.price,
      quantity: 1,
    };

    setProducts(states => [...states, cartProduct]);

    const parseProduct = JSON.stringify(cartProduct);

    await AsyncStorage.setItem(`@GoMarket:CartItem${product.id}`, parseProduct);
  }, []);

  const increment = useCallback(async id => {
    const storagedItem = await AsyncStorage.getItem(`@GoMarket:CartItem${id}`);

    if (storagedItem) {
      const product = JSON.parse(storagedItem);

      product.quantity += 1;

      await AsyncStorage.mergeItem(
        `@GoMarket:CartItem${id}`,
        JSON.stringify(product),
      );

      setProducts(states => {
        const uptadedState = states.map(state => {
          if (state.id === id) {
            return product;
          }
          return state;
        });

        return uptadedState;
      });
    }
  }, []);

  const decrement = useCallback(async id => {
    const storagedItem = await AsyncStorage.getItem(`@GoMarket:CartItem${id}`);

    if (storagedItem) {
      const product = JSON.parse(storagedItem);

      if (product.quantity === 1) {
        return;
      }

      product.quantity -= 1;

      await AsyncStorage.mergeItem(
        `@GoMarket:CartItem${id}`,
        JSON.stringify(product),
      );

      setProducts(states => {
        const uptadedState = states.map(state => {
          if (state.id === id) {
            return product;
          }
          return state;
        });

        return uptadedState;
      });
    }
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
