import { db } from "./db";
import { settings } from "./db/schema";

/**
 * Todos os textos institucionais editáveis no painel (/admin/conteudo).
 * O valor padrão aparece até alguém editar. Textos marcados com [placeholder]
 * ainda precisam ser definidos pela equipe.
 */
type FieldType = "text" | "textarea" | "url" | "email" | "color" | "image";

type FieldDef = {
  label: string;
  group: ContentGroup;
  type: FieldType;
  help?: string;
  default: string;
};

export const CONTENT_GROUPS = {
  home: "home",
  sobre: "sobre a nós",
  contato: "contato e redes",
  seo: "compartilhamento e google",
  legal: "política de privacidade e termos",
  cores: "cores do site",
} as const;
export type ContentGroup = keyof typeof CONTENT_GROUPS;

export const CONTENT_FIELDS = {
  // HOME
  hero_title: { group: "home", type: "text", label: "frase principal", default: "experiências para encontrar, conversar e estar." },
  hero_kicker: { group: "home", type: "text", label: "linha pequena acima do nome", default: "encontros presenciais para mulheres · porto alegre" },
  hero_image: { group: "home", type: "image", label: "foto de fundo do topo", help: "foto horizontal, de preferência com pessoas e luz natural", default: "/samples/amostra-01.jpg" },
  hero_video: { group: "home", type: "url", label: "vídeo de fundo (opcional)", help: "link direto para um .mp4 curto e leve. se preenchido, aparece no lugar da foto", default: "" },
  hero_cta: { group: "home", type: "text", label: "botão principal", default: "ver próximos encontros" },
  intro_title: { group: "home", type: "text", label: "título “o que é a nós?”", default: "o que é a nós?" },
  intro_text: {
    group: "home",
    type: "textarea",
    label: "texto “o que é a nós?”",
    default:
      "a nós é uma comunidade de experiências presenciais para mulheres em porto alegre. encontros pequenos, pensados com carinho, para conhecer gente nova, sair da rotina, experimentar coisas e simplesmente estar junto.",
  },
  intro_note: { group: "home", type: "text", label: "frase de apoio", default: "pode vir sozinha. a ideia é justamente essa." },
  marquee_words: { group: "home", type: "text", label: "palavras da faixa animada", help: "separe por vírgula", default: "encontrar, conversar, estar, pertencer, experimentar, chegar sozinha, sair acompanhada" },
  events_title: { group: "home", type: "text", label: "título dos próximos encontros", default: "próximos encontros" },
  gallery_title: { group: "home", type: "text", label: "título da seleção de fotos", default: "nós em fotos" },
  instagram_title: { group: "home", type: "text", label: "chamada do instagram", default: "o que acontece por aqui, aparece por lá." },

  // SOBRE
  about_title: { group: "sobre", type: "text", label: "título", default: "um lugar para se encontrar de verdade." },
  about_lead: {
    group: "sobre",
    type: "textarea",
    label: "texto de abertura",
    default:
      "a nós nasceu para criar espaços onde mulheres possam se encontrar de verdade.\n\nqueremos criar experiências que aproximem pessoas, estimulem conversas e façam com que cada mulher se sinta confortável para chegar sozinha, conhecer novas pessoas e fazer parte daquele momento.",
  },
  about_highlight: {
    group: "sobre",
    type: "textarea",
    label: "frase em destaque",
    default: "não é necessário chegar acompanhada. a ideia é justamente criar um espaço em que novas conexões possam acontecer naturalmente.",
  },
  about_image_1: { group: "sobre", type: "image", label: "foto 1", default: "/samples/amostra-04.jpg" },
  about_image_2: { group: "sobre", type: "image", label: "foto 2", default: "/samples/amostra-07.jpg" },
  about_image_3: { group: "sobre", type: "image", label: "foto 3", default: "/samples/amostra-10.jpg" },
  essence_text: {
    group: "sobre",
    type: "textarea",
    label: "nossa essência",
    default: "encontros pequenos, gente de verdade, conversa boa. sem pressa, sem pose, sem precisar conhecer ninguém antes.",
  },
  beliefs_text: {
    group: "sobre",
    type: "textarea",
    label: "o que acreditamos",
    help: "um item por linha",
    default:
      "amizade se faz em qualquer fase da vida.\nestar junto é um jeito de cuidar de si.\ncuriosidade aproxima mais do que afinidade.\nninguém precisa chegar pronta.",
  },
  experiences_text: {
    group: "sobre",
    type: "textarea",
    label: "como são nossas experiências",
    help: "um item por linha — use “título: descrição”",
    default:
      "pequenas: grupos reduzidos, para dar tempo de conversar com todo mundo.\npresenciais: nada de tela. é olho no olho, mão na massa.\ndiferentes: cada encontro tem uma proposta — aprender, provar, se movimentar, criar.\nacolhedoras: tem sempre alguém da nós te esperando na porta.",
  },

  // CONTATO
  instagram_handle: { group: "contato", type: "text", label: "instagram (sem @)", default: "thenos.club" },
  contact_email: { group: "contato", type: "email", label: "e-mail de contato", default: "[placeholder] contato@exemplo.com" },
  contact_whatsapp: { group: "contato", type: "text", label: "whatsapp de contato", help: "com DDD, ex.: 51 99999-9999", default: "[placeholder] 51 00000-0000" },
  contact_note: { group: "contato", type: "text", label: "frase do rodapé", default: "feito com calma em porto alegre." },

  // SEO
  seo_title: { group: "seo", type: "text", label: "título do site (google e abas)", default: "nós — experiências para encontrar, conversar e estar" },
  seo_description: {
    group: "seo",
    type: "textarea",
    label: "descrição para google e whatsapp",
    default:
      "nós é uma comunidade de experiências presenciais para mulheres em porto alegre: encontros para conhecer gente nova, conversar, experimentar e estar junto.",
  },

  // LEGAL
  terms_text: {
    group: "legal",
    type: "textarea",
    label: "texto do aceite no formulário",
    default: "li e aceito a política de privacidade e as regras do encontro.",
  },
  privacy_text: {
    group: "legal",
    type: "textarea",
    label: "política de privacidade",
    default:
      "[placeholder — revisar com apoio jurídico antes de publicar]\n\nusamos os dados que você envia na inscrição (nome, e-mail, telefone, instagram e cidade) apenas para organizar os encontros, confirmar sua participação e falar com você sobre eles.\n\nos pagamentos são processados pelo provedor de pagamento. a nós não recebe nem guarda dados de cartão.\n\nvocê pode pedir a exclusão dos seus dados a qualquer momento pelo nosso e-mail de contato.",
  },
  cancellation_text: {
    group: "legal",
    type: "textarea",
    label: "regras de cancelamento",
    help: "aparece na página de cada encontro",
    default: "[placeholder] defina aqui a política de cancelamento e reembolso.",
  },

  // CORES (identidade visual: letras & logos & cores)
  color_green: { group: "cores", type: "color", label: "verde nós (principal)", default: "#235c4c" },
  color_cream: { group: "cores", type: "color", label: "creme (fundo)", default: "#f1f1e5" },
  color_lime: { group: "cores", type: "color", label: "lima (destaque)", default: "#dded91" },
  color_pink: { group: "cores", type: "color", label: "rosa (destaque)", default: "#e18fa6" },
  color_mist: { group: "cores", type: "color", label: "cinza claro (fundo alternativo)", default: "#f3f4f7" },
  color_ink: { group: "cores", type: "color", label: "texto", help: "um verde bem escuro, para leitura confortável", default: "#173d33" },
} satisfies Record<string, FieldDef>;

export type ContentKey = keyof typeof CONTENT_FIELDS;
export type Content = Record<ContentKey, string>;

export function contentDefaults(): Content {
  return Object.fromEntries(
    Object.entries(CONTENT_FIELDS).map(([k, f]) => [k, f.default]),
  ) as Content;
}

export async function getContent(): Promise<Content> {
  const rows = await db.select().from(settings);
  const content = contentDefaults();
  for (const row of rows) {
    if (row.key in content) content[row.key as ContentKey] = row.value;
  }
  return content;
}

/** Texto é placeholder? (usado para destacar no painel) */
export function isPlaceholder(value: string) {
  return value.includes("[placeholder");
}

export function instagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}
