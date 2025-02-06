import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { villaApi } from '../../services/api';

interface Room {
  name: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  images: string[];
}

export function VillaRooms() {
  const { t, i18n } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await villaApi.getVillaRooms();
        setRooms(response.rooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading rooms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rooms.map((room, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            {room.images.length > 0 && (
              <div className="relative">
                <img
                  src={room.images[0]}
                  alt={room.name[i18n.language as 'en' | 'th']}
                  className="w-full h-64 object-cover"
                />
                {room.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    +{room.images.length - 1} more
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">
                {room.name[i18n.language as 'en' | 'th']}
              </h3>
              <p className="text-gray-600">
                {room.description[i18n.language as 'en' | 'th']}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
