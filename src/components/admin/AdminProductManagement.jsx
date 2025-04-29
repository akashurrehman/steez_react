import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getBrands } from '../../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, X } from 'lucide-react';

// Standard size options
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const AdminProductManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        brand_id: '',
        sizes: []
    });

    // Size management state
    const [newSize, setNewSize] = useState('');
    const [sizeStock, setSizeStock] = useState('');

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, categoriesRes, brandsRes] = await Promise.all([
                    getProducts(),
                    getCategories(),
                    getBrands()
                ]);

                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle select changes
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Add a new size to the product
    const handleAddSize = () => {
        if (newSize && sizeStock && !formData.sizes.some(s => s.size === newSize)) {
            setFormData(prev => ({
                ...prev,
                sizes: [...prev.sizes, { size: newSize, stock: parseInt(sizeStock) }]
            }));
            setNewSize('');
            setSizeStock('');
        }
    };

    // Remove a size from the product
    const handleRemoveSize = (sizeToRemove) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter(s => s.size !== sizeToRemove)
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category_id: '',
            brand_id: '',
            sizes: []
        });
        setImagePreview(null);
        setImageFile(null);
        setIsEditing(false);
        setCurrentProduct(null);
        setNewSize('');
        setSizeStock('');
    };

    // Update the handleSubmit function for edit mode
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);

            // Prepare product data with proper types
            const productData = {
                name: formData.name,
                description: formData.description || '',
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category_id: formData.category_id || null,
                brand_id: formData.brand_id || null,
                sizes: formData.sizes
            };

            // Only include image if it's a new file
            if (imageFile && (!currentProduct || imagePreview !== `https://api.steez.gr${currentProduct.image_url}`)) {
                productData.image = imageFile;
            }

            let response;
            if (isEditing && currentProduct) {
                console.log("Product data:",productData);

                response = await updateProduct(currentProduct.id, productData);
                console.log("Response of data uploaidng:",response.data);
                // Use the returned product data to update state
                setProducts(products.map(p =>
                    p.id === currentProduct.id ? response.data.product : p
                ));
            } else {
                response = await createProduct(productData);
                setProducts([...products, response.data]);
            }

            resetForm();
        } catch (error) {
            console.error('Product save error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    // Update the handleEdit function
    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsEditing(true);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category_id: product.category_id?.toString() || '',
            brand_id: product.brand_id?.toString() || '',
            sizes: product.sizes || []
        });
        if (product.image_url) {
            setImagePreview(`https://api.steez.gr${product.image_url}`);
        } else {
            setImagePreview(null);
        }
        setImageFile(null);
    };

    // Delete product
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
                setError('Failed to delete product');
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl">Unauthorized Access</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Product Management</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Form */}
                    <Card className="lg:col-span-1 bg-zinc-900 border-zinc-700">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {isEditing ? 'Edit Product' : 'Add New Product'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                price: isNaN(value) ? '' : value
                                            }));
                                        }}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stock">Default Stock Quantity</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="1"
                                        value={formData.stock}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                stock: isNaN(value) ? '' : value
                                            }));
                                        }}
                                        required
                                    />
                                </div>

                                {/* Size Management */}
                                <div>
                                    <Label>Product Sizes</Label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Select
                                                value={newSize}
                                                onValueChange={setNewSize}
                                            >
                                                <SelectTrigger className="w-full bg-zinc-800 text-white border border-zinc-600">
                                                    <SelectValue placeholder="Select size" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 text-white">
                                                    {SIZE_OPTIONS.map(size => (
                                                        <SelectItem key={size} value={size}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Stock"
                                                value={sizeStock}
                                                onChange={(e) => setSizeStock(e.target.value)}
                                                className="w-24"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddSize}
                                                className="bg-white text-black hover:bg-gray-200"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Display selected sizes */}
                                        <div className="space-y-1">
                                            {formData.sizes.map((sizeObj, index) => (
                                                <div key={index} className="flex items-center justify-between bg-zinc-800 p-2 rounded">
                                                    <span className="font-medium">{sizeObj.size}: {sizeObj.stock}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveSize(sizeObj.size)}
                                                        className="h-6 w-6 text-red-500 hover:bg-zinc-700"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => handleSelectChange('category_id', value)}
                                    >
                                        <SelectTrigger className="w-full bg-zinc-800 text-white border border-zinc-600">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 text-white">
                                            {categories.map(category => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Brand</Label>
                                    <Select
                                        value={formData.brand_id}
                                        onValueChange={(value) => handleSelectChange('brand_id', value)}
                                    >
                                        <SelectTrigger className="w-full bg-zinc-800 text-white border border-zinc-600">
                                            <SelectValue placeholder="Select a brand" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 text-white">
                                            {brands.map(brand => (
                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Product Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 w-32 object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="bg-white text-black hover:bg-gray-200">
                                        {isEditing ? 'Update Product' : 'Add Product'}
                                    </Button>
                                    {isEditing && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetForm}
                                            className="border-white text-white hover:bg-zinc-800"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Products List */}
                    <div className="lg:col-span-2">
                        <Card className="bg-zinc-900 border-zinc-700">
                            <CardHeader>
                                <CardTitle className="text-xl">Products List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Sizes</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.length > 0 ? (
                                            products.map(product => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        {product.image_url && (
                                                            <img
                                                                src={`https://api.steez.gr${product.image_url}`}
                                                                alt={product.name}
                                                                className="h-10 w-10 object-cover rounded-md"
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell>${product.price}</TableCell>
                                                    <TableCell>{product.stock}</TableCell>
                                                    <TableCell>
                                                        {product.sizes?.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {product.sizes.map((size, i) => (
                                                                    <span key={i} className="text-xs bg-zinc-700 px-2 py-1 rounded">
                                                                        {size.size}: {size.stock}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-zinc-500">No sizes</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleEdit(product)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(product.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">
                                                    No products found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductManagement;