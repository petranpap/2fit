<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BookingResource\Pages;
use App\Models\Booking;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

/**
 * Admin's platform-wide view over every booking (no user_id scoping, unlike
 * Partner's BookingResource) — oversight, e.g. stepping in on a dispute.
 * Notes stay read-only here too: they're the customer's own words.
 */
class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static ?string $navigationGroup = 'Commerce';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'confirmed' => 'Confirmed',
                    'cancelled' => 'Cancelled',
                ])
                ->required(),
            Textarea::make('notes')
                ->disabled()
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('user.name')->label('Customer')->searchable(),
                TextColumn::make('bookable_type')
                    ->label('Listing type')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->badge(),
                TextColumn::make('bookable.name')->label('Listing'),
                TextColumn::make('fitnessClass.name')->label('Class')->placeholder('—'),
                TextColumn::make('scheduled_at')->dateTime()->placeholder('—'),
                TextColumn::make('status')->badge()->color(fn (string $state) => match ($state) {
                    'pending' => 'warning',
                    'confirmed' => 'success',
                    'cancelled' => 'danger',
                }),
                TextColumn::make('created_at')->dateTime()->label('Requested'),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->with(['user', 'fitnessClass', 'bookable']);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
