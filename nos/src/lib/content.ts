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
  parcerias: "parcerias",
  contato: "contato e redes",
  seo: "compartilhamento e google",
  legal: "política de privacidade e termos",
  cores: "cores do site",
} as const;
export type ContentGroup = keyof typeof CONTENT_GROUPS;

export const CONTENT_FIELDS = {
  // HOME
  hero_title: { group: "home", type: "text", label: "frase principal", default: "um novo jeito de se encontrar." },
  hero_kicker: { group: "home", type: "text", label: "linha pequena acima do nome", default: "encontros presenciais para mulheres · porto alegre" },
  hero_image: { group: "home", type: "image", label: "foto de fundo do topo", help: "foto horizontal, de preferência com pessoas e luz natural", default: "/samples/amostra-01.jpg" },
  hero_video: { group: "home", type: "url", label: "vídeo de fundo (opcional)", help: "link direto para um .mp4 curto e leve. se preenchido, aparece no lugar da foto", default: "" },
  hero_cta: { group: "home", type: "text", label: "botão principal", default: "ver próximos encontros" },
  intro_title: { group: "home", type: "text", label: "título da apresentação", help: "se terminar com “nós”, essa palavra aparece como o logo", default: "a vida acontece entre nós" },
  intro_image: { group: "home", type: "image", label: "foto grande da apresentação", help: "ocupa a metade esquerda da seção “sobre nós”; de preferência vertical", default: "/samples/sobre-nos.jpg" },
  intro_text: {
    group: "home",
    type: "textarea",
    label: "texto “sobre nós”",
    help: "coloque um trecho entre **asteriscos duplos** para destacá-lo",
    default:
      "a nós nasceu da vontade de tornar a vida adulta mais leve, divertida e cheia de novas possibilidades. criamos experiências que queríamos viver. acreditamos que a vida fica muito mais interessante quando nos permitimos sair do automático, conhecer novas pessoas e colecionar histórias. mais do que eventos, queremos criar conexões, desatar nós e viver momentos que fazem tudo valer a pena. afinal, a vida acontece **entre nós.**",
  },
  intro_note: { group: "home", type: "text", label: "frase de apoio (manuscrita)", help: "opcional: deixe vazio para não mostrar", default: "" },
  marquee_words: { group: "home", type: "text", label: "palavras da faixa animada", help: "separe por vírgula", default: "encontros, conversas, conexão, pertencer, experiências, mulheres, independência" },
  events_title: { group: "home", type: "text", label: "título do calendário de eventos", help: "a primeira palavra aparece em letra de forma e o resto em itálico", default: "próximos eventos" },
  gallery_title: { group: "home", type: "text", label: "título da seleção de fotos", default: "nós em fotos" },
  instagram_title: { group: "home", type: "text", label: "chamada do instagram", default: "o que acontece por aqui, aparece por lá." },

  // SOBRE
  about_title: { group: "sobre", type: "text", label: "título", default: "um lugar para se encontrar de verdade." },
  about_lead: {
    group: "sobre",
    type: "textarea",
    label: "história da nós",
    help: "parágrafos separados por linha em branco; o 1º vira uma chamada pequena e o 2º fica em destaque",
    default:
      "conheça mais sobre a nós\n\nantes de sermos a nós, éramos só nós duas.\n\nhá cinco anos, nos conhecemos por uma daquelas coincidências bonitas da vida, viemos de cidades diferentes para porto alegre e acabamos morando juntas. o que não imaginávamos era que dividir o mesmo teto seria o começo de uma das partes mais especiais da nossa história.\n\ndesde então, nos tornamos melhores amigas, compartilhamos a vida e colecionamos memórias. sentíamos falta de ter com quem compartilhar novas experiências, conhecer lugares e viver coisas diferentes.\n\nfoi daí que nasceu a nós: da vontade de criar aquilo que gostaríamos de encontrar. um espaço para conhecer mulheres, construir conexões genuínas e transformar encontros em memórias especiais.\n\ncriamos experiências que queríamos viver. e queremos vivê-las com vocês. ♡",
  },
  about_highlight: {
    group: "sobre",
    type: "textarea",
    label: "frase em destaque",
    default: "não é necessário chegar acompanhada. a ideia é justamente criar um espaço em que novas conexões possam acontecer naturalmente.",
  },
  about_image_1: { group: "sobre", type: "image", label: "foto das fundadoras", help: "ocupa a metade esquerda da história; de preferência vertical", default: "/samples/sobre-duas.jpg" },

  // PARCERIAS
  partner_title: { group: "parcerias", type: "text", label: "título da página de parcerias", default: "vamos criar um encontro juntas?" },
  partner_text: {
    group: "parcerias",
    type: "textarea",
    label: "texto da página de parcerias",
    help: "parágrafos separados por linha em branco",
    default:
      "tem uma marca, um espaço ou uma ideia de experiência que combina com a nós? a gente adora criar encontros em parceria.\n\nconta um pouco sobre você e sobre a ideia — a gente lê tudo e responde por e-mail ou whatsapp.",
  },
  partner_footer: { group: "parcerias", type: "text", label: "chamada no rodapé", default: "quer fazer um evento em parceria com a nós?" },

  // CONTATO
  instagram_handle: { group: "contato", type: "text", label: "instagram (sem @)", default: "thenos.club" },
  contact_email: { group: "contato", type: "email", label: "e-mail de contato", default: "thenossclub@gmail.com" },
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
    default: "sabemos que imprevistos acontecem! caso precise cancelar sua participação, o reembolso poderá ser solicitado com até 3 dias de antecedência do evento." ,
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
