<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'number', 'project_id', 'user_id', 'amount', 'tax', 'total',
        'status', 'snap_token', 'snap_token_expires_at', 'midtrans_order_id', 'payment_type', 'payment_status', 'due_date', 'paid_at',
        'kind', 'label',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'snap_token_expires_at' => 'datetime',
    ];

    public const KIND_LABELS = [
        'dp' => 'DP 50% — Pembayaran Awal',
        'final' => 'Pelunasan 50% — Selesai Proyek',
        'full' => 'Full Payment',
    ];

    public function kindLabel(): string
    {
        return $this->label ?? self::KIND_LABELS[$this->kind ?? 'full'] ?? $this->kind;
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
