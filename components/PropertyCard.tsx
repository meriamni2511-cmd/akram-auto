
import React from 'react';
import { Bed, Bath, Maximize2, MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { Property, PropertyStatus } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.ACTIVE: return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case PropertyStatus.PUBLISHING: return 'bg-blue-500 text-white shadow-blue-500/20';
      case PropertyStatus.SOLD: return 'bg-gray-700 text-gray-300';
      default: return 'bg-orange-500 text-white shadow-orange-500/20';
    }
  };

  return (
    <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 shadow-2xl active:scale-[0.98]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white">
          <MapPin size={14} className="text-blue-500" />
          <span className="text-xs font-bold truncate max-w-[200px]">{property.location}</span>
        </div>
      </div>
      
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <h4 className="text-lg lg:text-xl font-black text-white italic tracking-tight leading-tight line-clamp-2">{property.title}</h4>
          <button className="p-2 lg:p-3 rounded-2xl bg-white/5 text-gray-500 hover:text-white transition-colors">
            <ExternalLink size={18} />
          </button>
        </div>
        
        <div className="flex items-center justify-between py-5 border-y border-white/5">
          <div className="flex flex-col items-center gap-1">
             <Bed size={16} className="text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{property.beds} BEDS</span>
          </div>
          <div className="w-px h-6 bg-white/5" />
          <div className="flex flex-col items-center gap-1">
             <Bath size={16} className="text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{property.baths} BATHS</span>
          </div>
          <div className="w-px h-6 bg-white/5" />
          <div className="flex flex-col items-center gap-1">
             <Maximize2 size={16} className="text-blue-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{property.sqft} SQFT</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price Guide</span>
            <p className="text-2xl font-black text-white italic tracking-tighter">
              RM {property.price.toLocaleString()}
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
            DETAILS
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
