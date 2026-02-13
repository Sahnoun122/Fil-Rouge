import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface NemotronApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly httpService: HttpService) {
    const apiUrl = process.env.NEMOTRON_API_URL;
    const apiKey = process.env.NEMOTRON_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new InternalServerErrorException(
        'NEMOTRON_API_URL and NEMOTRON_API_KEY environment variables are required',
      );
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.model = process.env.NEMOTRON_MODEL || 'nemotron-3-nano-30b-a3b';

    // Log de configuration en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 AI Service configured:', {
        url: apiUrl === 'mock' ? 'MOCK MODE' : apiUrl,
        model: this.model,
        mode: apiUrl === 'mock' ? 'Development Mock' : 'Production API'
      });
    }
  }

  /**
   * Calls Nemotron API with a prompt and returns the response text
   */
  async callNemotron(prompt: string): Promise<string> {
    // Mode mock pour développement
    if (this.apiUrl === 'mock') {
      return this.generateMockResponse(prompt);
    }

    try {
      const requestBody = {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      };

      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      // Log pour debugging (uniquement en développement)
      if (process.env.NODE_ENV === 'development') {
        console.log('🤖 Calling Nemotron API:', {
          url: this.apiUrl,
          model: this.model,
          promptLength: prompt.length,
        });
      }

      const response: AxiosResponse<NemotronApiResponse> = await firstValueFrom(
        this.httpService.post<NemotronApiResponse>(this.apiUrl, requestBody, { headers }),
      );

      const content = response.data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new InternalServerErrorException(
          'Invalid response format from Nemotron API',
        );
      }

      return content;
    } catch (error: any) {
      // Log détaillé en développement
      if (process.env.NODE_ENV === 'development') {
        console.error('🔥 Nemotron API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: this.apiUrl,
          model: this.model,
        });
      }

      if (error.response) {
        throw new BadRequestException(
          `Nemotron API error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`,
        );
      }
      
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to call Nemotron API: ${error.message}`,
      );
    }
  }

  /**
   * Génère une réponse mock pour le développement
   */
  private generateMockResponse(prompt: string): string {
    console.log('🎭 Using mock AI response for development');
    
    // Réponse mock structurée selon le schéma MongoDB
    return JSON.stringify({
      avant: {
        marcheCible: {
          persona: "Marie, 32 ans, responsable marketing dans une startup tech, soucieuse de qualité et d'impact environnemental",
          besoins: [
            "Café de qualité pour bien commencer la journée",
            "Lieu calme pour réunions informelles",
            "Options véganes et bio",
            "Service rapide entre deux rendez-vous",
            "Espace de coworking avec Wi-Fi"
          ],
          problemes: [
            "Manque de temps le matin",
            "Difficulté à trouver des produits éthiques",
            "Besoin d'un espace de travail nomade",
            "Budget serré mais priorité à la qualité"
          ],
          comportementDigital: [
            "Active sur LinkedIn et Instagram",
            "Utilise Google Maps pour trouver des lieux",
            "Lit les avis en ligne avant de tester",
            "Partage ses découvertes sur les réseaux sociaux"
          ]
        },
        messageMarketing: {
          propositionValeur: "Le premier café 100% bio et équitable du centre-ville avec espace coworking gratuit",
          messagePrincipal: "Savourez l'excellence éthique dans un cadre inspirant",
          tonCommunication: "Authentique, chaleureux et professionnel avec une pointe d'expertise"
        },
        canauxCommunication: {
          plateformes: ["Instagram", "LinkedIn", "Google My Business", "Facebook"],
          typesContenu: {
            instagram: ["Photos produits esthétiques", "Stories behind-the-scenes", "Témoignages clients"],
            tiktok: ["Processus de torréfaction", "Tips café du matin", "Ambiance coworking"],
            linkedin: ["Articles sur l'entrepreneuriat local", "Impact environnemental", "Networking events"],
            facebook: ["Événements communautaires", "Promotions", "Avis clients"]
          }
        }
      },
      pendant: {
        captureProspects: {
          landingPage: "Page d'accueil avec offre première visite gratuite et inscription newsletter avec guide café parfait",
          formulaire: "Formulaire court : prénom, email, préférence café (3 questions max) avec bouton CTA attractif",
          offreIncitative: [
            "Premier café offert lors de la première visite",
            "Guide gratuit 'Le café parfait en 5 étapes'",
            "Accès prioritaire aux événements networking",
            "10% de réduction sur le premier achat"
          ]
        },
        nurturing: {
          sequenceEmails: [
            "Email de bienvenue avec votre guide café offert",
            "Histoire de notre torréfacteur local (J+3)",
            "5 raisons de choisir le bio (J+7)",
            "Invitation à votre première visite (J+10)"
          ],
          contenusEducatifs: [
            "Blog sur les bienfaits du café bio",
            "Vidéos de préparation par notre barista",
            "Newsletter mensuelle avec recettes",
            "Webinaires sur l'entrepreneuriat local"
          ],
          relances: [
            "SMS de rappel pour l'offre première visite",
            "Email personnalisé basé sur les préférences",
            "Invitation événement networking mensuel"
          ]
        },
        conversion: {
          cta: [
            "Réservez votre table dès maintenant",
            "Commandez en ligne, récupérez en 5 min",
            "Rejoignez notre club fidélité"
          ],
          offres: [
            "Carte fidélité : 10ème café offert",
            "Formule coworking journée à 15€",
            "Menu déjeuner + café à 12€"
          ],
          argumentaireVente: [
            "Café 100% bio et équitable, torréfié localement chaque semaine",
            "Espace coworking avec Wi-Fi fibre, prises et ambiance inspirante",
            "Pâtisseries fraîches de notre boulanger partenaire local",
            "Impact positif : 1% du CA reversé aux producteurs"
          ]
        }
      },
      apres: {
        experienceClient: {
          recommendations: [
            "Programme fidélité avec récompenses personnalisées",
            "Service de commande par SMS pour les habitués",
            "Événements networking mensuels exclusifs",
            "Feedback régulier via sondages courts"
          ]
        },
        augmentationValeurClient: {
          upsell: [
            "Abonnement café mensuel avec livraison",
            "Formule coworking illimitée mensuelle",
            "Cours de barista privés"
          ],
          crossSell: [
            "Vente de grains de café à emporter",
            "Accessoires café (tasses, moulins)",
            "Paniers cadeaux entreprise"
          ],
          fidelite: [
            "Carte VIP avec réductions progressives",
            "Accès prioritaire aux nouveautés",
            "Événements exclusifs membres"
          ]
        },
        recommandation: {
          parrainage: [
            "Parrainez un ami, recevez tous deux un café gratuit",
            "Programme ambassadeur pour les gros consommateurs",
            "Réductions corporate pour les entreprises locales"
          ],
          avisClients: [
            "Système de review automatique post-visite",
            "Incentive pour laisser des avis (café offert)",
            "Mise en avant des témoignages sur les réseaux"
          ],
          recompenses: [
            "Client du mois avec photo et récompense",
            "Concours photo #MonMomentCafé",
            "Points fidélité convertibles en cadeaux"
          ]
        }
      }
    }, null, 2);
  }

  /**
   * Safely parses JSON text, returns null if parsing fails
   */
  safeJsonParse(text: string): any {
    try {
      return JSON.parse(text.trim());
    } catch (error) {
      return null;
    }
  }

  /**
   * Calls Nemotron API and attempts to parse the response as JSON
   * Retries once with a JSON fix prompt if initial parsing fails
   */
  async callNemotronAndParseJson(prompt: string): Promise<any> {
    // First attempt
    const firstResponse = await this.callNemotron(prompt);
    const firstParsed = this.safeJsonParse(firstResponse);

    if (firstParsed !== null) {
      return firstParsed;
    }

    // Retry with JSON fix prompt
    const fixPrompt = `Fix JSON and return only valid JSON: ${firstResponse}`;
    const secondResponse = await this.callNemotron(fixPrompt);
    const secondParsed = this.safeJsonParse(secondResponse);

    if (secondParsed !== null) {
      return secondParsed;
    }

    // Both attempts failed
    throw new BadRequestException(
      'Failed to parse valid JSON from Nemotron API response after retry',
    );
  }
}