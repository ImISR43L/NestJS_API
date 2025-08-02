// frontend/src/pages/ShopPage.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { PetItem } from '../types';

interface ShopPageProps {
  onItemPurchased: () => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ onItemPurchased }) => {
  const [shopItems, setShopItems] = useState<PetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<PetItem[]>('/pet/shop');
        setShopItems(response.data);
      } catch (err) {
        setError('Failed to fetch shop items.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopItems();
  }, []);

  const handleBuyItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to buy this item?')) {
      try {
        await apiClient.post(`/pet/shop/buy/${itemId}`);
        alert('Purchase successful!');
        onItemPurchased();
      } catch (error: any) {
        alert(
          `Error: ${error.response?.data?.message || 'Could not purchase item.'}`,
        );
      }
    }
  };

  if (loading) return <div>Loading shop...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Item Shop</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {shopItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #555',
              padding: '10px',
              borderRadius: '8px',
              width: '200px',
            }}
          >
            <h4>{item.name}</h4>
            <p style={{ fontSize: '0.9em', color: '#aaa' }}>
              {item.description}
            </p>
            <p>Cost: {item.cost} Gold</p>
            <button onClick={() => handleBuyItem(item.id)}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
