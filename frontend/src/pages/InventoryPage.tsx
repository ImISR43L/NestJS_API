// frontend/src/pages/InventoryPage.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { UserPetItem, ItemType } from '../types';

interface InventoryPageProps {
  onPetUpdated: () => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ onPetUpdated }) => {
  const [inventory, setInventory] = useState<UserPetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<UserPetItem[]>('/pet/inventory');
      setInventory(response.data);
    } catch (err) {
      setError('Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUseItem = async (userPetItemId: string) => {
    try {
      await apiClient.post('/pet/use', { userPetItemId });
      alert('Item used successfully!');
      fetchInventory();
      onPetUpdated();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Could not use item.'}`);
    }
  };

  const handleEquipItem = async (userPetItemId: string) => {
    try {
      await apiClient.post('/pet/equip', { userPetItemId });
      alert('Item equipped successfully!');
      onPetUpdated();
    } catch (error: any) {
      alert(
        `Error: ${error.response?.data?.message || 'Could not equip item.'}`,
      );
    }
  };

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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
};

export default InventoryPage;
