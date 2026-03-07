"use client";

// Composant de formulaire pour créer une stratégie marketing
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building,
  Users,
  Target,
  DollarSign,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  GenerateStrategyDto,
  MainObjective,
  Tone,
  OBJECTIVE_OPTIONS,
  TONE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "../../types/strategy.types";

// Schema de validation Zod
const strategySchema = z.object({
  businessName: z
    .string()
    .min(1, "Le nom de l'entreprise est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  industry: z
    .string()
    .min(1, "Le secteur d'activité est requis")
    .max(50, "Le secteur ne peut pas dépasser 50 caractères"),
  productOrService: z
    .string()
    .min(
      10,
      "La description du produit/service doit contenir au moins 10 caractères",
    )
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  targetAudience: z
    .string()
    .min(1, "L'audience cible est requise")
    .max(100, "L'audience cible ne peut pas dépasser 100 caractères"),
  location: z
    .string()
    .min(1, "La localisation est requise")
    .max(50, "La localisation ne peut pas dépasser 50 caractères"),
  mainObjective: z.nativeEnum(MainObjective, {
    error: "Veuillez sélectionner un objectif principal",
  }),
  tone: z.nativeEnum(Tone, {
    error: "Veuillez sélectionner un ton de communication",
  }),
  budget: z
    .number()
    .min(0, "Le budget doit être supérieur ou égal à 0")
    .max(10000000, "Le budget ne peut pas dépasser 10 millions")
    .optional(),
  language: z.string().optional(),
});

type StrategyFormData = z.infer<typeof strategySchema>;

interface StrategyFormProps {
  onSubmit: (data: GenerateStrategyDto) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<GenerateStrategyDto>;
  className?: string;
}

export default function StrategyForm({
  onSubmit,
  isLoading = false,
  initialData,
  className = "",
}: StrategyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      businessName: initialData?.businessName || "",
      industry: initialData?.industry || "",
      productOrService: initialData?.productOrService || "",
      targetAudience: initialData?.targetAudience || "",
      location: initialData?.location || "",
      mainObjective: initialData?.mainObjective || MainObjective.LEADS,
      tone: initialData?.tone || Tone.PROFESSIONAL,
      budget: initialData?.budget || undefined,
      language: initialData?.language || 'French',
    },
    mode: "onChange",
  });

  // Surveiller les changements pour afficher un résumé
  const watchedData = watch();

  const handleFormSubmit = async (data: StrategyFormData) => {
    try {
      await onSubmit(data);
      // Optionnel : reset du formulaire après soumission réussie
      // reset();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  const resetForm = () => {
    reset();
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Section Informations Business */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informations Business
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom de l'entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                {...register("businessName")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.businessName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Ex: TechCorp Solutions"
                disabled={isLoading}
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Secteur d'activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité *
              </label>
              <input
                {...register("industry")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.industry
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Ex: Technologie, Santé, Finance..."
                disabled={isLoading}
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.industry.message}
                </p>
              )}
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation *
              </label>
              <input
                {...register("location")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.location
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Ex: Paris, France"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget marketing mensuel (€)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("budget", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="100"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.budget
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="5000"
                  disabled={isLoading}
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.budget.message}
                </p>
              )}
            </div>
          </div>

          {/* Description produit/service */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du produit/service *
            </label>
            <textarea
              {...register("productOrService")}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                errors.productOrService
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder="Décrivez en détail votre produit ou service, ses avantages et ce qui le rend unique..."
              disabled={isLoading}
            />
            {errors.productOrService && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.productOrService.message}
              </p>
            )}
            <div className="mt-1 text-sm text-gray-500">
              {watchedData.productOrService?.length || 0}/500 caractères
            </div>
          </div>
        </div>

        {/* Section Audience Cible */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Audience Cible
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description de l'audience cible *
            </label>
            <input
              {...register("targetAudience")}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.targetAudience
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder="Ex: Entrepreneurs entre 25-45 ans, dirigeants de PME..."
              disabled={isLoading}
            />
            {errors.targetAudience && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.targetAudience.message}
              </p>
            )}
          </div>
        </div>

        {/* Section Stratégie Marketing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Stratégie Marketing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectif principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectif principal *
              </label>
              <select
                {...register("mainObjective")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.mainObjective
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                {OBJECTIVE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.mainObjective && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.mainObjective.message}
                </p>
              )}
            </div>

            {/* Ton de communication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ton de communication *
              </label>
              <select
                {...register("tone")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.tone
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                {TONE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.tone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.tone.message}
                </p>
              )}
            </div>

            {/* Langue de génération */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue de génération
              </label>
              <select
                {...register("language")}
                className="w-full px-4 py-3 border border-gray-300 hover:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              >
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Résumé des données saisies */}
        {isDirty && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              Aperçu de votre stratégie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Entreprise:</span>
                <span className="ml-2 text-blue-700">
                  {watchedData.businessName || "Non renseigné"}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Secteur:</span>
                <span className="ml-2 text-blue-700">
                  {watchedData.industry || "Non renseigné"}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Objectif:</span>
                <span className="ml-2 text-blue-700">
                  {
                    OBJECTIVE_OPTIONS.find(
                      (opt) => opt.value === watchedData.mainObjective,
                    )?.label
                  }
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Ton:</span>
                <span className="ml-2 text-blue-700">
                  {
                    TONE_OPTIONS.find((opt) => opt.value === watchedData.tone)
                      ?.label
                  }
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Langue:</span>
                <span className="ml-2 text-blue-700">
                  {LANGUAGE_OPTIONS.find((opt) => opt.value === watchedData.language)?.label || watchedData.language || 'Français'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Bouton Reset */}
          <button
            type="button"
            onClick={resetForm}
            disabled={isLoading || !isDirty}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Réinitialiser
          </button>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className={`inline-flex items-center px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
              isLoading || !isValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Générer ma stratégie IA
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
