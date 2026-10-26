<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Self-referencing: a subcategory (e.g. "CrossFit") points back to
            // its main category (e.g. "Gyms"). Null means this category IS a
            // main/top-level one.
            $table->foreignId('parent_id')->nullable()->after('id')
                ->constrained('categories')->nullOnDelete();

            // Which top-level categories actually appear as the app's main
            // quick-browse tiles (Home icons, Explore's "Top Categories").
            // Lets a top-level category exist for data organization (e.g.
            // "Shops", grouping sportswear/supplements) without cluttering
            // that primary browse UI.
            $table->boolean('is_primary')->default(false)->after('icon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn('is_primary');
        });
    }
};
