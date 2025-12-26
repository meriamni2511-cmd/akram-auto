
import React from 'react';
import { Bed, Bath, Maximize2, MapPin, ExternalLink } from 'lucide-react';
import { Property, PropertyStatus } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.ACTIVE: return 'bg-green-500/10 text-green-500 border-green-500/20';
      case PropertyStatus.PUBLISHING: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case PropertyStatus.SOLD: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-md ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-100 line-clamp-1">{property.title}</h4>
          <button className="text-gray-500 hover:text-blue-500">
            <ExternalLink size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
          <MapPin size={12} />
          {property.location}
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#2a2a2a] mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Bed size={14} className="text-blue-500" />
            {property.beds} Beds
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Bath size={14} className="text-blue-500" />
            {property.baths} Baths
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Maximize2 size={14} className="text-blue-500" />
            {property.sqft} ft²
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-blue-500">
            ${property.price.toLocaleString()}
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-xs font-semibold text-gray-200 hover:bg-blue-600 hover:text-white transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
