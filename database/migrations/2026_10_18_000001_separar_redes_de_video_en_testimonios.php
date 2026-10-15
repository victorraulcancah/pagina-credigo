<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * El testimonio lleva un enlace por red (TikTok, YouTube y Facebook) en vez de uno solo:
 * en la historia sale un ícono por cada uno. El enlace que ya había pasa a la columna de su red.
 */
return new class extends Migration
{
    private const REDES = [
        'tiktok_url' => ['%tiktok.com/%'],
        'youtube_url' => ['%youtube.com/%', '%youtu.be/%'],
        'facebook_url' => ['%facebook.com/%', '%fb.watch/%'],
    ];

    public function up(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->string('tiktok_url')->nullable()->after('calificacion');
            $table->string('youtube_url')->nullable()->after('tiktok_url');
            $table->string('facebook_url')->nullable()->after('youtube_url');
        });

        foreach (self::REDES as $columna => $patrones) {
            DB::table('testimonios')
                ->where(fn ($q) => collect($patrones)->each(fn ($patron) => $q->orWhere('video_url', 'like', $patron)))
                ->update([$columna => DB::raw('video_url')]);
        }

        Schema::table('testimonios', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });
    }

    public function down(): void
    {
        Schema::table('testimonios', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('calificacion');
        });

        DB::table('testimonios')->update(['video_url' => DB::raw('COALESCE(tiktok_url, youtube_url, facebook_url)')]);

        Schema::table('testimonios', function (Blueprint $table) {
            $table->dropColumn(['tiktok_url', 'youtube_url', 'facebook_url']);
        });
    }
};
