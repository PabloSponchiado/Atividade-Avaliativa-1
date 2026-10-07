import { Platform } from "react-native";

const FAVORITES_FILE = "favoritos.json";
const WEB_STORAGE_KEY = "pokeapp_favoritos";

interface FavoritesData {
    favoritos: number[];
}

function normalizarIds(value: unknown): number[] {
    if (!value || typeof value !== "object" || !("favoritos" in value)) {
        return [];
    }

    const favoritos = (value as FavoritesData).favoritos;
    if (!Array.isArray(favoritos)) return [];

    return [...new Set(favoritos.filter(
        (id): id is number => Number.isSafeInteger(id) && id > 0
    ))];
}

async function lerFavoritosWeb(): Promise<number[]> {
    if (typeof window === "undefined") return [];

    const dados = window.localStorage.getItem(WEB_STORAGE_KEY);
    if (!dados) return [];

    try {
        return normalizarIds(JSON.parse(dados));
    } catch {
        return [];
    }
}

async function lerFavoritosNativo(): Promise<number[]> {
    const { File, Paths } = await import("expo-file-system");
    const arquivo = new File(Paths.document, FAVORITES_FILE);
    if (!arquivo.exists) return [];

    try {
        return normalizarIds(JSON.parse(await arquivo.text()));
    } catch {
        return [];
    }
}

async function gravarFavoritos(favoritos: number[]): Promise<void> {
    const dados: FavoritesData = { favoritos: normalizarIds({ favoritos }) };

    if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(dados));
        }
        return;
    }

    const { File, Paths } = await import("expo-file-system");
    const arquivo = new File(Paths.document, FAVORITES_FILE);
    if (!arquivo.exists) arquivo.create({ intermediates: true });
    arquivo.write(JSON.stringify(dados, null, 2));
}

export async function buscarFavoritos(): Promise<number[]> {
    return Platform.OS === "web" ? lerFavoritosWeb() : lerFavoritosNativo();
}

export async function adicionarFavorito(id: number): Promise<number[]> {
    const favoritos = await buscarFavoritos();
    if (!Number.isSafeInteger(id) || id <= 0 || favoritos.includes(id)) {
        return favoritos;
    }

    const atualizados = [...favoritos, id];
    await gravarFavoritos(atualizados);
    return atualizados;
}

export async function removerFavorito(id: number): Promise<number[]> {
    const favoritos = await buscarFavoritos();
    const atualizados = favoritos.filter((favoritoId) => favoritoId !== id);
    if (atualizados.length !== favoritos.length) {
        await gravarFavoritos(atualizados);
    }
    return atualizados;
}

export async function ehFavorito(id: number): Promise<boolean> {
    return (await buscarFavoritos()).includes(id);
}

export async function alternarFavorito(id: number): Promise<boolean> {
    const favoritos = await buscarFavoritos();
    const jaFavoritado = favoritos.includes(id);
    const atualizados = jaFavoritado
        ? favoritos.filter((favoritoId) => favoritoId !== id)
        : Number.isSafeInteger(id) && id > 0
            ? [...favoritos, id]
            : favoritos;

    if (atualizados !== favoritos) {
        await gravarFavoritos(atualizados);
    }

    return !jaFavoritado && Number.isSafeInteger(id) && id > 0;
}

export async function limparFavoritos(): Promise<void> {
    await gravarFavoritos([]);
}