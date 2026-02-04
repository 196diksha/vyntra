import { useEffect, useState } from 'react';
import { FiBox, FiEdit2, FiImage, FiList, FiPlus } from 'react-icons/fi';
import axios from 'axios';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    sizes: '',
    specifications: ''
  });
  const [specRows, setSpecRows] = useState([
    { label: '', value: '' },
    { label: '', value: '' }
  ]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const categoryOptions = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Accessories', 'Sports', 'Other'];
  const sizeCategories = ['Clothing', 'Accessories', 'Sports'];
  const showSizes = sizeCategories.includes(form.category);
  const [images, setImages] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/products');
      setProducts(data.products || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [imagePreviews]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
    imagePreviews.forEach((src) => URL.revokeObjectURL(src));
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      sizes: '',
      specifications: ''
    });
    setSpecRows([{ label: '', value: '' }, { label: '', value: '' }]);
    setImages([]);
    setImagePreviews([]);
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      brand: product.brand || '',
      stock: product.stock || '',
      sizes: product.sizes?.join(', ') || '',
      specifications: ''
    });
    setSpecRows(
      product.specifications?.length
        ? product.specifications.map((spec) => ({ label: spec.label || '', value: spec.value || '' }))
        : [{ label: '', value: '' }]
    );
    setImages([]);
    setImagePreviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSpecRow = (index, field, value) => {
    setSpecRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addSpecRow = () => {
    setSpecRows((prev) => [...prev, { label: '', value: '' }]);
  };

  const removeSpecRow = (index) => {
    setSpecRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category || !form.brand || !form.stock) {
      setError('Please fill in all fields');
      return;
    }
    const sizesValue = showSizes ? form.sizes : '';
    if (images.length === 0) {
      setError('Please add at least one product image');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('brand', form.brand);
      formData.append('stock', form.stock);
      formData.append('sizes', sizesValue);
      const specLines = specRows
        .map((row) => ({
          label: row.label.trim(),
          value: row.value.trim()
        }))
        .filter((row) => row.label && row.value)
        .map((row) => `${row.label}: ${row.value}`);
      formData.append('specifications', specLines.join('\n'));
      images.forEach((file) => formData.append('images', file));

      if (editingId) {
        await axios.put(`/api/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || (editingId ? 'Failed to update product' : 'Failed to create product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${productId}`);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Admin Studio</p>
            <h1 className="text-4xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500 mt-2">Create, showcase, and curate your inventory with style.</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-white shadow-sm border text-sm text-slate-500">
            All fields required
          </div>
        </div>

        <div className="card p-0 mb-10 overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
                <FiBox className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Add New Product</h2>
                <p className="text-xs text-white/80">Fill the essentials and publish instantly.</p>
              </div>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/80">Vyntra</span>
          </div>

          <form onSubmit={handleCreateProduct} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Name</label>
              <input
                name="name"
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Classic Crewneck Sweatshirt"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Brand</label>
              <input
                name="brand"
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={form.brand}
                onChange={handleInputChange}
                placeholder="Vyntra Essentials"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Category</label>
              <select
                name="category"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={form.category}
                onChange={handleInputChange}
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Price</label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-1 px-3 bg-slate-50 border-r">
                  <span className="text-sm font-semibold text-slate-800">₹</span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-sm text-slate-400">$</span>
                </div>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 outline-none"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="1999"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className={`grid gap-4 ${showSizes ? 'grid-cols-[140px,1fr]' : 'grid-cols-[140px]'}`}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    value={form.stock}
                    onChange={handleInputChange}
                  />
                </div>
                {showSizes && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Sizes</label>
                    <input
                      name="sizes"
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="S, M, L, XL"
                      value={form.sizes}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
              {!showSizes && (
                <p className="text-xs text-slate-400 mt-2">Sizes are only required for clothing/accessories/sports.</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Description</label>
              <textarea
                name="description"
                rows="4"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Add a vivid product description..."
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6 self-start">
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <FiImage />
                <p className="text-sm font-semibold uppercase tracking-wide">Product Images</p>
              </div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl px-4 py-6 bg-white cursor-pointer hover:border-indigo-400 transition">
                <FiPlus className="text-indigo-500 text-xl" />
                <span className="text-sm text-slate-600 mt-2">Upload up to 5 images</span>
                <span className="text-xs text-slate-400">PNG, JPG, WEBP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {imagePreviews.slice(0, 6).map((src) => (
                    <div key={src} className="h-20 rounded-xl overflow-hidden border bg-white">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 bg-white max-h-[520px] overflow-auto">
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <FiList />
                <p className="text-sm font-semibold uppercase tracking-wide">Specifications</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {specRows.map((row, index) => (
                  <div key={`spec-${index}`} className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Label"
                      className="border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      value={row.label}
                      onChange={(e) => updateSpecRow(index, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className="border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      value={row.value}
                      onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
                    />
                    {specRows.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-red-600 text-left"
                        onClick={() => removeSpecRow(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSpecRow}
                className="mt-3 text-sm text-indigo-600 hover:underline"
              >
                + Add spec
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Quick Actions</p>
              <div className="flex items-center gap-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Product' : 'Create Product')}
                </button>
                <button type="button" className="btn btn-outline" onClick={resetForm} disabled={isSubmitting}>
                  {editingId ? 'Cancel' : 'Clear'}
                </button>
              </div>
            </div>
          </div>
          </form>
        </div>

        {loading ? (
          <div className="card p-6">Loading products...</div>
        ) : error ? (
          <div className="card p-6 text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="card p-6">No products found.</div>
        ) : (
          <div className="card p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border">
                          {product.images?.[0] ? (
                            <img
                              src={`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.stock}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {product.sizes?.length ? (
                          <div>Sizes: {product.sizes.join(', ')}</div>
                        ) : (
                          <div>Sizes: -</div>
                        )}
                        {product.specifications?.length ? (
                          <div>Specs: {product.specifications.length}</div>
                        ) : (
                          <div>Specs: -</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-indigo-600 hover:text-indigo-800 mr-4 inline-flex items-center gap-1"
                          type="button"
                        >
                          <FiEdit2 className="text-sm" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
