<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Partner\Resources\BookingResource\Pages;
use App\Models\Booking;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * The CRM view: every customer booking against the partner's own listing,
 * with the one action that matters — confirm or cancel it.
 */
class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    public static function getNavigationLabel(): string
    {
        return __('partner.nav.bookings');
    }

    public static function getModelLabel(): string
    {
        return __('partner.model.booking');
    }

    public static function getPluralModelLabel(): string
    {
        return __('partner.model.bookings');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('status')->label(__('partner.fields.status'))
                ->options([
                    'pending' => __('partner.options.pending'),
                    'confirmed' => __('partner.options.confirmed'),
                    'cancelled' => __('partner.options.cancelled'),
                ])
                ->required(),
            Textarea::make('notes')->label(__('partner.fields.notes'))
                ->disabled()
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')->label(__('partner.fields.user_name'))->searchable(),
                TextColumn::make('fitnessClass.name')->label(__('partner.fields.fitness_class_name'))->placeholder('—'),
                TextColumn::make('scheduled_at')->label(__('partner.fields.scheduled_at'))->dateTime()->placeholder('—'),
                TextColumn::make('status')->label(__('partner.fields.status'))->badge()->formatStateUsing(fn (string $state): string => __('partner.options.'.$state))->color(fn (string $state) => match ($state) {
                    'pending' => 'warning',
                    'confirmed' => 'success',
                    'cancelled' => 'danger',
                }),
                TextColumn::make('created_at')->label(__('partner.fields.created_at'))->dateTime()->label(__('partner.fields.created_at')),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
            ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    /**
     * A partner only ever has one listing (their own gym/trainer/shop) —
     * scope bookings to whichever one that is, regardless of type.
     */
    public static function getEloquentQuery(): Builder
    {
        $userId = auth()->id();

        return parent::getEloquentQuery()
            ->with(['user', 'fitnessClass'])
            ->whereHasMorph(
                'bookable',
                [Gym::class, Trainer::class, Shop::class],
                fn (Builder $query) => $query->where('user_id', $userId),
            );
    }

    public static function shouldRegisterNavigation(): bool
    {
        return in_array(auth()->user()?->role, ['gym_owner', 'trainer', 'shop'], true);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }
}
