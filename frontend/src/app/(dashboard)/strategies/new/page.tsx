'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Sparkles, 
  Building, 
  Users, 
  Target, 
  DollarSign,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';

// Zod schema for form validation
const strategySchema = z.object({
  business: z.object({
    name: z.string().min(1, 'Business name is required'),
    industry: z.string().min(1, 'Industry is required'),
    offer: z.string().min(10, 'Offer description must be at least 10 characters'),
    location: z.string().min(1, 'Location is required'),
  }),
  audience: z.object({
    target: z.string().min(1, 'Target audience is required'),
    ageRange: z.string().min(1, 'Age range is required'),
    needs: z.array(z.string().min(1, 'Need cannot be empty')).min(1, 'At least one need is required'),
  }),
  marketing: z.object({
    objective: z.enum(['leads', 'sales', 'awareness', 'engagement'], {
      required_error: 'Marketing objective is required',
    }),
    tone: z.enum(['friendly', 'professional', 'luxury', 'funny'], {
      required_error: 'Communication tone is required',
    }),
    monthlyBudget: z.number().min(1, 'Budget must be at least $1'),
    platformsPreferred: z.array(z.string()).min(1, 'At least one platform must be selected'),
  }),
});

type StrategyFormData = z.infer<typeof strategySchema>;

const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'google-ads', label: 'Google Ads' },
  { id: 'youtube', label: 'YouTube' },
];

export default function NewStrategyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      business: {
        name: '',
        industry: '',
        offer: '',
        location: '',
      },
      audience: {
        target: '',
        ageRange: '',
        needs: [''],
      },
      marketing: {
        objective: 'leads',
        tone: 'professional',
        monthlyBudget: 1000,
        platformsPreferred: [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'audience.needs',
  });

  const selectedPlatforms = watch('marketing.platformsPreferred');

  const handlePlatformChange = (platformId: string) => {
    const currentPlatforms = selectedPlatforms || [];
    const newPlatforms = currentPlatforms.includes(platformId)
      ? currentPlatforms.filter(p => p !== platformId)
      : [...currentPlatforms, platformId];
    
    setValue('marketing.platformsPreferred', newPlatforms);
  };

  const onSubmit = async (data: StrategyFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/strategies/generate-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate strategy');
      }

      const result = await response.json();
      router.push(`/strategies/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Marketing Strategy
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill out the form below to generate a comprehensive marketing strategy powered by AI
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Building className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  {...register('business.name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                />
                {errors.business?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.business.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <input
                  {...register('business.industry')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Tech, Healthcare, Retail"
                />
                {errors.business?.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.business.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  {...register('business.location')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., New York, US"
                />
                {errors.business?.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.business.location.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Offer *
              </label>
              <textarea
                {...register('business.offer')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your product or service in detail..."
              />
              {errors.business?.offer && (
                <p className="mt-1 text-sm text-red-600">{errors.business.offer.message}</p>
              )}
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Target Audience</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <input
                  {...register('audience.target')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Small business owners"
                />
                {errors.audience?.target && (
                  <p className="mt-1 text-sm text-red-600">{errors.audience.target.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range *
                </label>
                <input
                  {...register('audience.ageRange')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25-45"
                />
                {errors.audience?.ageRange && (
                  <p className="mt-1 text-sm text-red-600">{errors.audience.ageRange.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audience Needs *
              </label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <input
                      {...register(`audience.needs.${index}` as const)}
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe a need or pain point"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => append('')}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Need
                </button>
              </div>
              {errors.audience?.needs && (
                <p className="mt-1 text-sm text-red-600">{errors.audience.needs.message}</p>
              )}
            </div>
          </div>

          {/* Marketing Strategy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Marketing Strategy</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketing Objective *
                </label>
                <select
                  {...register('marketing.objective')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="leads">Generate Leads</option>
                  <option value="sales">Increase Sales</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="engagement">Customer Engagement</option>
                </select>
                {errors.marketing?.objective && (
                  <p className="mt-1 text-sm text-red-600">{errors.marketing.objective.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Tone *
                </label>
                <select
                  {...register('marketing.tone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="luxury">Luxury</option>
                  <option value="funny">Funny</option>
                </select>
                {errors.marketing?.tone && (
                  <p className="mt-1 text-sm text-red-600">{errors.marketing.tone.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Budget (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('marketing.monthlyBudget', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
              {errors.marketing?.monthlyBudget && (
                <p className="mt-1 text-sm text-red-600">{errors.marketing.monthlyBudget.message}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Platforms *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {platforms.map((platform) => (
                  <label key={platform.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms?.includes(platform.id) || false}
                      onChange={() => handlePlatformChange(platform.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{platform.label}</span>
                  </label>
                ))}
              </div>
              {errors.marketing?.platformsPreferred && (
                <p className="mt-1 text-sm text-red-600">{errors.marketing.platformsPreferred.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Strategy with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}