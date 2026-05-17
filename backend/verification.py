"""
ReachCT — verification.py
Uses spaCy + NLTK to positively verify if a company matches the query.
No exclusion/flagging — unverified companies are marked Needs Checking.
"""

import re

_nlp        = None
_stop_words = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            try:
                _nlp = spacy.load("es_core_news_sm")
            except OSError:
                try:
                    _nlp = spacy.load("en_core_web_sm")
                except OSError:
                    _nlp = None
        except ImportError:
            _nlp = None
    return _nlp


def _get_stopwords():
    global _stop_words
    if _stop_words is None:
        try:
            from nltk.corpus import stopwords
            import nltk
            try:
                _stop_words = set(stopwords.words("spanish")) | set(stopwords.words("english"))
            except LookupError:
                nltk.download("stopwords", quiet=True)
                _stop_words = set(stopwords.words("spanish")) | set(stopwords.words("english"))
        except ImportError:
            _stop_words = set()
    return _stop_words


# ── Industry keyword map ──────────────────────────────────────────────────────
INDUSTRY_KEYWORDS = {
    "software":      ["software", "desarrollo", "development", "aplicación", "app",
                      "tech", "tecnología", "digital", "programación", "web", "cloud",
                      "saas", "soluciones", "sistema", "plataforma", "código"],
    "marketing":     ["marketing", "publicidad", "branding", "campaña", "agencia",
                      "seo", "sem", "social media", "redes sociales", "estrategia",
                      "contenido", "anuncios", "comunicación"],
    "restaurant":    ["restaurante", "cocina", "menú", "gastronomía", "chef",
                      "reserva", "platos", "comida", "bar", "cafetería"],
    "hotel":         ["hotel", "alojamiento", "habitación", "suite", "hospedaje",
                      "reserva", "check-in", "turismo"],
    "lawyer":        ["abogado", "legal", "derecho", "bufete", "despacho",
                      "jurídico", "asesoría legal", "notaría"],
    "consulting":    ["consultoría", "consulting", "asesoría", "estrategia",
                      "gestión", "management", "advisory", "outsourcing"],
    "construction":  ["construcción", "obra", "edificio", "arquitectura",
                      "reformas", "ingeniería", "proyecto", "inmobiliaria"],
    "accounting":    ["contabilidad", "fiscalidad", "gestoría", "auditoría",
                      "impuestos", "contable", "asesoría fiscal"],
    "healthcare":    ["clínica", "médico", "salud", "hospital", "farmacia",
                      "dentista", "fisioterapia", "terapia"],
    "logistics":     ["logística", "transporte", "distribución", "almacén",
                      "envío", "flota", "cadena de suministro"],
}


def _clean_text(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def _tokenize(text: str) -> list:
    stop_words = _get_stopwords()
    tokens = re.findall(r"\b[a-záéíóúñü]{3,}\b", text.lower())
    return [t for t in tokens if t not in stop_words]


def _get_industry_keywords(query: str) -> list:
    query_lower = query.lower()
    keywords = []
    for key, words in INDUSTRY_KEYWORDS.items():
        if key in query_lower:
            keywords.extend(words)
    keywords.extend([w for w in query_lower.split() if len(w) > 3])
    return list(set(keywords)) if keywords else query_lower.split()


def _spacy_check(text: str) -> int:
    """Returns a score based on how many ORG entities spaCy finds."""
    nlp = _get_nlp()
    if nlp is None:
        return 0
    doc       = nlp(text[:5000])
    org_count = sum(1 for ent in doc.ents if ent.label_ in ("ORG", "PER", "GPE"))
    return min(org_count * 10, 40)


def verify(page_text: str, website: str, query: str = "") -> dict:
    """
    Positively verifies if a company matches the query using spaCy + NLTK.
    Never excludes — unverified = Needs Checking.
    """
    if not website:
        return {
            "category": "📵 No Website",
            "passed":   True,
            "reason":   "no website found on Google Maps",
        }

    if not page_text or len(page_text.strip()) < 50:
        return {
            "category": "⚠️ Needs Checking",
            "passed":   True,
            "reason":   "website could not be scraped",
        }

    cleaned = _clean_text(page_text)

    # ── Keyword score ─────────────────────────────────────────────────────────
    keywords  = _get_industry_keywords(query) if query else []
    matched   = [kw for kw in keywords if kw in cleaned]
    kw_score  = min(int((len(matched) / max(len(keywords), 1)) * 60), 60) if keywords else 0

    # ── NLTK token density score ──────────────────────────────────────────────
    tokens          = _tokenize(cleaned)
    industry_tokens = set(kw for kws in INDUSTRY_KEYWORDS.values() for kw in kws)
    token_matches   = sum(1 for t in tokens if t in industry_tokens)
    nltk_score      = min(token_matches * 2, 20)

    # ── spaCy ORG entity score ────────────────────────────────────────────────
    spacy_score = _spacy_check(page_text)

    # ── Final score ───────────────────────────────────────────────────────────
    total      = kw_score + nltk_score + spacy_score
    confidence = min(int(total * 0.85), 100)

    if confidence >= 40:
        return {
            "category": "✅ Verified",
            "passed":   True,
            "reason":   f"matched: {', '.join(matched[:4]) if matched else 'industry tokens'}",
        }

    return {
        "category": "⚠️ Needs Checking",
        "passed":   True,
        "reason":   f"low confidence ({confidence}%) — review manually",
    }