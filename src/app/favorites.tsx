import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { limparFavoritos, buscarFavoritos, removerFavorito } from "../services/FavoritesStorage";
import Pokemon from "../interface/InterfacePokemon";
import PokemonRequests from "../services/PokemonRequests";

export default function FavoritesScreen() {
    const router = useRouter();
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");

    const loadFavorites = useCallback(async () => {
        setIsLoading(true);
        setError("");
        try {
            const ids = await buscarFavoritos();
            setFavoriteCount(ids.length);
            const pokemon = await Promise.all(
                ids.map((id) => PokemonRequests.fetchPokemonData(String(id)))
            );
            setPokemonList(pokemon.filter((item): item is Pokemon => Boolean(item)));
        } catch (loadError) {
            console.error("Erro ao carregar favoritos:", loadError);
            setError("Não foi possível carregar os favoritos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadFavorites();
        }, [loadFavorites])
    );

    const handleRemove = async (id: number) => {
        setIsUpdating(true);
        try {
            const ids = await removerFavorito(id);
            setFavoriteCount(ids.length);
            setPokemonList((current) => current.filter((pokemon) => pokemon.pokemon_id !== id));
        } catch (removeError) {
            console.error("Erro ao remover favorito:", removeError);
            setError("Não foi possível remover o favorito.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = async () => {
        setIsUpdating(true);
        try {
            await limparFavoritos();
            setPokemonList([]);
            setFavoriteCount(0);
        } catch (clearError) {
            console.error("Erro ao limpar favoritos:", clearError);
            setError("Não foi possível limpar os favoritos.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Meus favoritos</Text>
                    <Text style={styles.count}>⭐ {favoriteCount} {favoriteCount === 1 ? "favorito" : "favoritos"}</Text>
                </View>

                {favoriteCount > 0 ? (
                    <Pressable
                        accessibilityRole="button"
                        disabled={isUpdating}
                        onPress={handleClear}
                        style={[styles.clearButton, isUpdating && styles.disabledButton]}
                    >
                        <Text style={styles.clearButtonText}>🗑 Limpar favoritos</Text>
                    </Pressable>
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#ef4444" style={styles.loader} />
                ) : pokemonList.length > 0 ? (
                    <View style={styles.list}>
                        {pokemonList.map((pokemon) => (
                            <View key={pokemon.pokemon_id} style={styles.card}>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => router.push(`/pokemon/${pokemon.pokemon_id}` as any)}
                                    style={styles.pokemonButton}
                                >
                                    <Image source={{ uri: pokemon.pokemon_image }} style={styles.image} contentFit="contain" />
                                    <View style={styles.details}>
                                        <Text style={styles.pokemonName} numberOfLines={1}>
                                            {pokemon.pokemon_name.charAt(0).toUpperCase() + pokemon.pokemon_name.slice(1)}
                                        </Text>
                                        <Text style={styles.pokemonId}>#{String(pokemon.pokemon_id).padStart(3, "0")}</Text>
                                    </View>
                                </Pressable>
                                <Pressable
                                    accessibilityLabel={`Remover ${pokemon.pokemon_name} dos favoritos`}
                                    disabled={isUpdating}
                                    onPress={() => pokemon.pokemon_id && handleRemove(pokemon.pokemon_id)}
                                    style={styles.removeButton}
                                >
                                    <Text style={styles.removeText}>❤️</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                ) : !error ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🤍</Text>
                        <Text style={styles.emptyTitle}>Sua lista está vazia</Text>
                        <Text style={styles.emptyText}>Favorite Pokémon na tela de detalhes para encontrá-los aqui.</Text>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#0f172a" },
    container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
    header: { marginBottom: 20 },
    title: { color: "#f8fafc", fontSize: 28, fontWeight: "800" },
    count: { color: "#cbd5e1", fontSize: 15, fontWeight: "600", marginTop: 6 },
    clearButton: { alignSelf: "flex-start", backgroundColor: "#7f1d1d", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, marginBottom: 16 },
    clearButtonText: { color: "#fee2e2", fontSize: 14, fontWeight: "700" },
    disabledButton: { opacity: 0.6 },
    error: { color: "#fca5a5", textAlign: "center", marginVertical: 16 },
    loader: { marginTop: 40 },
    list: { gap: 12 },
    card: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderColor: "#334155", borderWidth: 1, borderRadius: 18, padding: 10 },
    pokemonButton: { flex: 1, flexDirection: "row", alignItems: "center" },
    image: { width: 76, height: 76 },
    details: { flex: 1, marginLeft: 10 },
    pokemonName: { color: "#f8fafc", fontSize: 17, fontWeight: "700" },
    pokemonId: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
    removeButton: { padding: 12 },
    removeText: { fontSize: 20 },
    emptyState: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 60 },
    emptyIcon: { fontSize: 44, marginBottom: 12 },
    emptyTitle: { color: "#e2e8f0", fontSize: 19, fontWeight: "700" },
    emptyText: { color: "#94a3b8", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
});