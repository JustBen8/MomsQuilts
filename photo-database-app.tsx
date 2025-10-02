import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Edit2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoDatabaseApp = () => {
  // Load data from localStorage or use sample data
  const loadInitialData = () => {
    const saved = localStorage.getItem('photoDatabaseItems');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        itemNumber: 101,
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'],
        description: 'Beautiful mountain landscape at sunset with snow-capped peaks and alpine meadows.',
        dateCreated: '2024-01-15'
      },
      {
        id: 2,
        itemNumber: 102,
        images: [
          'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400',
          'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400'
        ],
        description: 'Coastal view with dramatic cliffs and ocean waves crashing against rocks.',
        dateCreated: '2024-02-20'
      }
    ];
  };

  const [items, setItems] = useState(loadInitialData);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize selectedItem after items are loaded
  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('photoDatabaseItems', JSON.stringify(items));
  }, [items]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      });
    });

    Promise.all(imagePromises).then(results => {
      const validImages = results.filter(img => img !== null);
      setEditForm({ 
        ...editForm, 
        images: [...editForm.images, ...validImages] 
      });
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = editForm.images.filter((_, i) => i !== index);
    setEditForm({ ...editForm, images: newImages });
  };

  const handleEdit = () => {
    setEditForm({ ...selectedItem });
    setIsEditing(true);
    setCurrentImageIndex(0);
  };

  const handleSave = () => {
    const updatedItems = items.map(item => 
      item.id === editForm.id ? editForm : item
    );
    setItems(updatedItems);
    setSelectedItem(editForm);
    setIsEditing(false);
    setEditForm(null);
    setCurrentImageIndex(0);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(null);
    setCurrentImageIndex(0);
  };

  const handleAdd = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItemNumber = Math.max(...items.map(i => i.itemNumber), 100) + 1;
    const newItem = {
      id: newId,
      itemNumber: newItemNumber,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'],
      description: 'New item description',
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setItems([...items, newItem]);
    setSelectedItem(newItem);
  };

  const handleDelete = (id) => {
    const filteredItems = items.filter(item => item.id !== id);
    setItems(filteredItems);
    if (selectedItem && selectedItem.id === id && filteredItems.length > 0) {
      setSelectedItem(filteredItems[0]);
    }
    setIsEditing(false);
  };

  const nextImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedItem.images.length);
    }
  };

  const prevImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="text-white" size={32} />
                <h1 className="text-3xl font-bold text-white">Photo Database</h1>
              </div>
              <button
                onClick={handleAdd}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <Plus size={20} />
                Add New
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Item List Sidebar */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Items ({items.length})
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsEditing(false);
                      setCurrentImageIndex(0);
                    }}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedItem && selectedItem.id === item.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">#{item.itemNumber}</div>
                    <div className="text-sm text-gray-600 truncate">{item.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.dateCreated} • {item.images.length} image{item.images.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Display Area */}
            <div className="lg:col-span-2">
              {selectedItem && (
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  {!isEditing ? (
                    <>
                      {/* View Mode */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm text-gray-500 uppercase tracking-wide">Item Number</div>
                            <div className="text-3xl font-bold text-gray-800">#{selectedItem.itemNumber}</div>
                            <div className="text-sm text-gray-500 mt-1">ID: {selectedItem.id}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleEdit}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                              <Edit2 size={18} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(selectedItem.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="mb-4 relative">
                          {selectedItem.images && selectedItem.images.length > 0 && (
                            <>
                              <img
                                src={selectedItem.images[currentImageIndex]}
                                alt={`Item ${currentImageIndex + 1}`}
                                className="w-full h-80 object-cover rounded-lg shadow-md"
                              />
                              
                              {selectedItem.images.length > 1 && (
                                <>
                                  <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                  >
                                    <ChevronLeft size={24} />
                                  </button>
                                  <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                  >
                                    <ChevronRight size={24} />
                                  </button>
                                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {selectedItem.images.length}
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Image Thumbnails */}
                          {selectedItem.images.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                              {selectedItem.images.map((img, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                    idx === currentImageIndex
                                      ? 'border-blue-500 ring-2 ring-blue-300'
                                      : 'border-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  <img
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">Description</div>
                            <p className="text-gray-800 leading-relaxed">{selectedItem.description}</p>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-1">Date Created</div>
                            <p className="text-gray-800">{selectedItem.dateCreated}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Edit Mode */}
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-800">Edit Item</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                            >
                              <Save size={18} />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
                            >
                              <X size={18} />
                              Cancel
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Item Number (3 digits)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={editForm.itemNumber}
                              onChange={(e) => setEditForm({ ...editForm, itemNumber: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Images ({editForm.images.length})
                            </label>
                            <div className="space-y-3">
                              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit">
                                <Camera size={18} />
                                Upload Images
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                              
                              {/* Image Grid in Edit Mode */}
                              <div className="grid grid-cols-2 gap-3">
                                {editForm.images.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={img}
                                      alt={`Image ${idx + 1}`}
                                      className="w-full h-40 object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                      onClick={() => handleRemoveImage(idx)}
                                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                      {idx + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Description (max 200 tokens)
                            </label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows="4"
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Date Created
                            </label>
                            <input
                              type="date"
                              value={editForm.dateCreated}
                              onChange={(e) => setEditForm({ ...editForm, dateCreated: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDatabaseApp;