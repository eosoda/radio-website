
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Route Handler para buscar metadados da música atual.
 * Atua como um proxy para contornar problemas de CORS.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get('url');
  
  // URL padrão caso não seja fornecida uma específica no painel admin
  const RADIO_URL = urlParam || "https://URL:PORT/currentsong";

  try {
    const response = await fetch(RADIO_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/plain, application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Servidor de rádio respondeu com status: ${response.status}`);
    }

    const text = await response.text();
    return NextResponse.json({ 
      song: text.trim() || "Nenhuma música identificada" 
    });
  } catch (error: any) {
    console.error("Erro ao buscar tocando agora:", error);
    return NextResponse.json(
      { song: "Erro ao carregar metadados", error: true },
      { status: 500 }
    );
  }
}
