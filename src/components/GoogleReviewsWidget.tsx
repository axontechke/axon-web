import React, { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle, Send, Smartphone, Monitor, Globe } from "lucide-react";
import API_ROUTES from "../config/api-routes";

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  source: string;
  approved: boolean;
  verified: boolean;
  date: string;
  deviceInfo?: string;
}

interface GoogleReviewsWidgetProps {
  compact?: boolean;
  showForm?: boolean;
}

export const GoogleReviewsWidget: React.FC<GoogleReviewsWidgetProps> = ({ 
  compact = false, 
  showForm = true 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formAuthor, setFormAuthor] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await fetch(API_ROUTES.reviews.list);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formContent.trim()) {
      setFormError("Name and review text are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch(API_ROUTES.reviews.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: formAuthor.trim(),
          rating: formRating,
          title: formTitle.trim(),
          content: formContent.trim(),
          source: "website"
        })
      });

      if (res.ok) {
        setSubmitted(true);
        setFormAuthor("");
        setFormRating(5);
        setFormTitle("");
        setFormContent("");
        loadReviews();
      } else {
        setFormError("Failed to submit review. Please try again.");
      }
    } catch (err) {
      setFormError("Network error. Could not reach server.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 
      : 0
  }));

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "mobile": return <Smartphone className="w-3 h-3" />;
      case "desktop": return <Monitor className="w-3 h-3" />;
      case "google": return <Globe className="w-3 h-3" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-6 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-surface-container-high rounded w-48"></div>
          <div className="h-4 bg-surface-container-high rounded w-32"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-surface-container-high rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-outline/10 rounded-3xl overflow-hidden" id="google-reviews-widget">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-outline/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm sm:text-base text-on-surface flex items-center gap-2 whitespace-nowrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-primary" />
              </div>
              Customer Reviews
            </h3>
            <p className="text-[10px] text-on-surface-variant/70">
              {reviews.length} verified review{reviews.length !== 1 ? "s" : ""} from our customers
            </p>
          </div>
          {showForm && !showSubmitForm && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="px-3 py-2 bg-primary/10 text-primary hover:bg-primary/15 text-[10px] sm:text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 w-fit"
            >
              <MessageSquare className="w-3 h-3" />
              Write a Review
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Rating Summary */}
        <div className={`${compact ? "lg:col-span-4" : "lg:col-span-3"} p-6 border-b lg:border-b-0 lg:border-r border-outline/10 space-y-4`}>
          <div className="text-center space-y-2">
            <div className="text-4xl font-display font-black text-on-surface">{averageRating}</div>
            <div className="flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? "text-primary fill-primary" : "text-outline/30"}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant/70">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-1.5">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2 text-[10px]">
                <span className="text-on-surface-variant w-3 text-right">{stars}</span>
                <Star className="w-3 h-3 text-primary fill-primary" />
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-on-surface-variant/70 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className={`${compact ? "lg:col-span-8" : "lg:col-span-9"} p-6 space-y-4`}>
          {/* Submit Form */}
          {showSubmitForm && (
            <div className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
              {submitted ? (
                <div className="text-center py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-on-surface">Review Submitted!</h4>
                  <p className="text-[11px] text-on-surface-variant">Thank you for your feedback.</p>
                  <button 
                    onClick={() => { setShowSubmitForm(false); setSubmitted(false); }}
                    className="text-[11px] text-primary font-bold hover:underline"
                  >
                    Submit another review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Share Your Experience</h4>
                    <button type="button" onClick={() => setShowSubmitForm(false)} className="text-[10px] text-on-surface-variant hover:text-on-surface">Cancel</button>
                  </div>

                  {formError && (
                    <div className="bg-red-500/5 border border-red-500/15 text-red-500 p-2 rounded-xl text-[10px] font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant block">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John D."
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        className="w-full bg-surface-container border border-outline/15 rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant block">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormRating(star)}
                            className="p-0.5"
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${
                                star <= formRating ? "text-primary fill-primary" : "text-outline/30 hover:text-primary/50"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant block">Review Title (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazing quality!"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-surface-container border border-outline/15 rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant block">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us about your experience..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full bg-surface-container border border-outline/15 rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Reviews Feed */}
          <div className={`space-y-3 ${compact ? "max-h-96" : "max-h-[600px]"} overflow-y-auto pr-1 scrollbar-thin`}>
            {reviews.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Star className="w-8 h-8 text-outline/30 mx-auto" />
                <p className="text-[11px] text-on-surface-variant/70">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-surface border border-outline/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-bold">
                        {review.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-on-surface">{review.author}</span>
                          {review.verified && (
                            <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 text-[8px] font-bold rounded-full uppercase">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant/60">
                          {getSourceIcon(review.source)}
                          <span>{new Date(review.date).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? "text-primary fill-primary" : "text-outline/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="text-[11px] font-bold text-on-surface">{review.title}</h4>
                  )}
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{review.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
