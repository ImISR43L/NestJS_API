// frontend/src/pages/PetPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { Pet, User, UserPetItem, PetItem, ItemType } from '../types';

interface PetPageProps {
  user: User;
  refreshUser: () => void;
}

type PetMainView = 'inventory' | 'shop';

const PetPage: React.FC<PetPageProps> = ({ user, refreshUser }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [inventory, setInventory] = useState<UserPetItem[]>([]);
  const [shopItems, setShopItems] = useState<PetItem[]>([]);
  const [mainView, setMainView] = useState<PetMainView>('inventory');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [petResponse, inventoryResponse, shopResponse] = await Promise.all([
        apiClient.get<Pet>('/pet'),
        apiClient.get<UserPetItem[]>('/pet/inventory'),
        apiClient.get<PetItem[]>('/pet/shop'),
      ]);
      setPet(petResponse.data);
      setInventory(inventoryResponse.data);
      setShopItems(shopResponse.data);
    } catch (error) {
      console.error('Failed to fetch pet data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshUser]);

  const handleUseItem = async (userPetItemId: string) => {
    try {
      await apiClient.post('/pet/use', { userPetItemId });
      alert('Item used successfully!');
      fetchData();
      refreshUser();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Could not use item.'}`);
    }
  };

  const handleEquipItem = async (userPetItemId: string) => {
    try {
      await apiClient.post('/pet/equip', { userPetItemId });
      alert('Item equipped successfully!');
      fetchData();
    } catch (error: any) {
      alert(
        `Error: ${error.response?.data?.message || 'Could not equip item.'}`,
      );
    }
  };

  const handleBuyItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to buy this item?')) {
      try {
        await apiClient.post(`/pet/shop/buy/${itemId}`);
        alert('Purchase successful!');
        fetchData();
        refreshUser();
      } catch (error: any) {
        alert(
          `Error: ${error.response?.data?.message || 'Could not purchase item.'}`,
        );
      }
    }
  };

  const renderMainView = () => {
    switch (mainView) {
      case 'inventory':
        return (
          <div>
            <h3>My Inventory</h3>
            {inventory.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {inventory.map(({ id, item, quantity }) => (
                  <div
                    key={id}
                    style={{
                      border: '1px solid #555',
                      padding: '10px',
                      borderRadius: '8px',
                      width: '200px',
                    }}
                  >
                    <h4>
                      {item.name} (x{quantity})
                    </h4>
                    <p style={{ fontSize: '0.9em', color: '#aaa' }}>
                      {item.description}
                    </p>
                    {item.type === ItemType.CUSTOMIZATION ? (
                      <button onClick={() => handleEquipItem(id)}>Equip</button>
                    ) : (
                      <button onClick={() => handleUseItem(id)}>Use</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Your inventory is empty. Visit the shop to get new items!</p>
            )}
          </div>
        );

      case 'shop':
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
      default:
        return null;
    }
  };

  if (loading) return <div>Loading Pet and Items...</div>;
  if (!pet) return <div>Could not load pet data.</div>;

  return (
    <div className="pet-view-layout">
      <div className="left-container">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setMainView('inventory')}>Inventory</button>
          <button onClick={() => setMainView('shop')}>Shop</button>
        </div>
        {renderMainView()}
      </div>
      <div className="right-container">
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h3>{pet.name}</h3>
          <div
            style={{
              width: '150px',
              height: '150px',
              backgroundColor: '#eee',
              borderRadius: '50%',
              margin: '20px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
            }}
          >
            <span>🐾</span>
          </div>
          <div>
            <p>Health: {pet.health}/100</p>
            <p>Hunger: {pet.hunger}/100</p>
            <p>Happiness: {pet.happiness}/100</p>
            <p>Energy: {pet.energy}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetPage;
