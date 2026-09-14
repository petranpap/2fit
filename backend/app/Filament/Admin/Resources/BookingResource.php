<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\BookingResource\Pages;
use App\Models\Booking;
use App\Models\FitnessClass;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Admin's platform-wide view over every booking (no user_id scoping, unlike
 * Partner's BookingResource) — oversight (e.g. stepping in on a dispute)
 * plus creating one directly on a customer's behalf (e.g. a phone booking).
 * Notes stay read-only once created — they're the customer's own words.
 */
class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static ?string $navigationGroup = 'Commerce';

    private const BOOKABLE_TYPE_OPTIONS = [
        Gym::class => 'Gym',
        Trainer::class => 'Trainer',
        Shop::class => 'Shop',
    ];

    public static function form(Form $form): Form
    {
        return $form->schema([
            // Only meaningful at creation — who/what a booking is for isn't
            // something you reassign afterwards.
            Select::make('user_id')
                ->label('Customer')
                ->options(fn (): array => User::where('role', 'user')
                    ->get()
                    ->mapWithKeys(fn (User $user): array => [$user->id => "{$user->name} ({$user->email})"])
                    ->all())
                ->searchable()
                ->required()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('bookable_type')
                ->label('Listing type')
                ->options(self::BOOKABLE_TYPE_OPTIONS)
                ->required()
                ->live()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('bookable_id')
                ->label('Listing')
                ->options(fn (Get $get): array => match ($get('bookable_type')) {
                    Gym::class => Gym::pluck('name', 'id')->all(),
                    Trainer::class => Trainer::pluck('name', 'id')->all(),
                    Shop::class => Shop::pluck('name', 'id')->all(),
                    default => [],
                })
                ->searchable()
                ->required()
                ->live()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('fitness_class_id')
                ->label('Class (optional)')
                ->options(fn (Get $get): array => $get('bookable_type') && $get('bookable_id')
                    ? FitnessClass::where('classable_type', $get('bookable_type'))
                        ->where('classable_id', $get('bookable_id'))
                        ->pluck('name', 'id')
                        ->all()
                    : [])
                ->helperText('Leave blank for a generic booking (not tied to a scheduled class).')
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            DateTimePicker::make('scheduled_at')
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'confirmed' => 'Confirmed',
                    'cancelled' => 'Cancelled',
                ])
                ->default('pending')
                ->required(),
            Textarea::make('notes')
                ->disabled(fn (string $operation): bool => $operation === 'edit')
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

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['user', 'fitnessClass', 'bookable']);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }
}
