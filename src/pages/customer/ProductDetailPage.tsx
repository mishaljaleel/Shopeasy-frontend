import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, ArrowLeft, Truck, RefreshCw, ShoppingCart, CheckCircle2, MessageSquarePlus, Heart, Compass, Image as ImageIcon } from 'lucide-react';
import api from '../../api/client';
import { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product3DViewer } from '../../components/Product3DViewer';
import { ProductRecommendations } from '../../components/ProductRecommendations';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [mediaMode, setMediaMode] = useState<'photo' | '3d'>('photo');

  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get<Product>(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get<Review[]>(`/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productID: product.productID,
        rating: newRating,
        comment: newComment,
      });
      setNewComment('');
      setReviewSuccess('Review submitted successfully!');
      setTimeout(() => setReviewSuccess(''), 4000);
      fetchReviews();
      fetchProduct();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block">Return to Catalog</Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {/* Product Media Column with 3D Inspector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Visualizer</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMediaMode('photo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  mediaMode === 'photo'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  mediaMode === '3d'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>3D 360° Inspector</span>
              </button>
            </div>
          </div>

          {mediaMode === 'photo' ? (
            <div className="relative aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <Product3DViewer product={product} />
          )}
        </div>

        {/* Product Metadata & Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {product.categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sold by <span className="font-semibold text-slate-700">{product.merchantName}</span>
            </p>
          </div>

          {/* Ratings & Stock */}
          <div className="flex items-center gap-4 border-y border-slate-100 py-3">
            <div className="flex items-center gap-1 text-amber-500 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-slate-800">{product.avgRating.toFixed(1)}</span>
              <span className="text-slate-400 text-xs">({reviews.length} customer reviews)</span>
            </div>

            <span className="text-slate-300">|</span>

            <div>
              {product.stock > 5 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  ⚠️ Low Stock (Only {product.stock} left)
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs text-slate-400 font-medium">Standard Retail Price</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{formattedPrice}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Inclusive of all local taxes & shipping</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description || 'Crafted with premium materials and designed for high durability and performance.'}
            </p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all ${
                  product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{added ? 'Added to Cart!' : 'Add to Shopping Cart'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  isInWishlist(product.productID)
                    ? removeFromWishlist(product.productID)
                    : addToWishlist(product)
                }
                className={`p-3 rounded-xl border transition shadow-sm ${
                  isInWishlist(product.productID)
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title={
                  isInWishlist(product.productID)
                    ? 'Remove from Wishlist'
                    : 'Save to Wishlist'
                }
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.productID) ? 'fill-rose-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Truck className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="font-semibold text-slate-700">Free Express Delivery</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="font-semibold text-slate-700">PCI Secure Payments</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <RefreshCw className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="font-semibold text-slate-700">7-Day Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="pt-10 border-t border-slate-200 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verified Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">Authentic feedback from verified purchasers</p>
          </div>
        </div>

        {/* Add Review Form */}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
              Leave Your Rating & Feedback
            </h3>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
                {reviewSuccess}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What did you like or dislike about this product?"
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-800 flex items-center justify-between">
            <span>Sign in to share your product experience and rating with shoppers.</span>
            <Link to="/login" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Sign In</Link>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.reviewID} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{r.userName}</span>
                    {r.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {r.comment || 'No written comment provided.'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>

      {/* Smart AI Product Recommendations */}
      <ProductRecommendations
        currentProductId={product.productID}
        categoryName={product.categoryName}
      />
    </div>
  );
};
