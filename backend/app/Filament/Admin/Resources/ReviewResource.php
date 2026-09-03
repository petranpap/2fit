<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Resources\Resource;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Reviews are user-authored content — moderation here means removing
 * inappropriate ones, never rewriting them, so there's no create/edit page.
 */
class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('user.name')->label('By')->searchable(),
                TextColumn::make('reviewable_type')
                    ->label('On')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->badge(),
                TextColumn::make('reviewable.name')->label('Listing'),
                TextColumn::make('rating')->formatStateUsing(fn (int $state): string => str_repeat('★', $state)),
                TextColumn::make('comment')->limit(60)->wrap(),
                TextColumn::make('created_at')->label('Posted')->dateTime('d M Y')->sortable(),
            ])
            ->filters([
                Filter::make('low_rated')
                    ->label('Low rated (≤ 2 ★)')
                    ->query(fn (Builder $query) => $query->where('rating', '<=', 2)),
            ])
            ->actions([
                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReviews::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
