                     import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from "react-native";
import ShowPokemon from "../../components/ShowPokemon/ShowPokemon";
import Pokemon from "../../interface/InterfacePokemon";
import Requests from "../../services/PokemonRequests";
import { alternarFavorito, ehFavorito } from "../../services/FavoritesStorage";

export default function PokemonDetail() {
    const params = useLocalSearchParams<{ id: string }>();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
    const [favoriteError, setFavoriteError] = useState("");

    useEffect(() => {
        if (!params.id) return;

        const loadPokemonData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await Requests.fetchPokemonData(params.id);
                if (data) {
                    setPokemon(data);
                    if (data.pokemon_id) {
                        setIsFavorite(await ehFavorito(data.pokemon_id));
                    }
                } else {
                    setError("Não foi possível carregar os detalhes do Pokémon.");
                }
            } catch (loadError) {
                console.error("Error loading pokemon detail:", loadError);
                setError("Erro ao carregar os dados.");
            } finally {
                setIsLoading(false);
            }
        };

        loadPokemonData();
    }, [params.id]);

    const handleToggleFavorite = async () => {
        if (!pokemon?.pokemon_id || isFavoriteLoading) return;

        setIsFavoriteLoading(true);
        setFavoriteError("");
        try {
            setIsFavorite(await alternarFavorito(pokemon.pokemon_id));
        } catch (favoriteSaveError) {
            console.error("Erro ao salvar favorito:", favoriteSaveError);
            setFavoriteError("Não foi possível salvar o favorito.");
        } finally {
            setIsFavoriteLoading(false);
        }
    };

    if (isLoading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FF3E3E" /><Text style={styles.loadingText}>Carregando detalhes...</Text></SafeAreaView>;
    }

    if (error || !pokemon) {
        return <SafeAreaView style={styles.center}><Text style={styles.errorText}>{error || "Pokémon não encontrado"}</Text></SafeAreaView>;
    }

    return <SafeAreaView style={styles.container}><Stack.Screen options={{ title: "Detalhes" }} /><ShowPokemon pokemon={pokemon} isFavorite={isFavorite} isFavoriteLoading={isFavoriteLoading} favoriteError={favoriteError} onToggleFavorite={handleToggleFavorite} /></SafeAreaView>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F7FAFC" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7FAFC", padding: 20 },
    loadingText: { marginTop: 12, fontSize: 16, color: "#718096", fontWeight: "500" },
    errorText: { fontSize: 16, color: "#E53E3E", fontWeight: "500", textAlign: "center" },
});