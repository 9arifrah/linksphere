export interface PasswordStrength {
  score: number // 0-5
  label: string
  color: string
  suggestions: string[]
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  const suggestions: string[] = []

  if (!password) {
    return {
      score: 0,
      label: 'Masukkan password',
      color: 'bg-slate-200',
      suggestions: []
    }
  }

  // Length check
  if (password.length >= 8) score++
  else suggestions.push('Minimal 8 karakter')

  // Lowercase
  if (/[a-z]/.test(password)) score++
  else suggestions.push('Tambahkan huruf kecil')

  // Uppercase
  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Tambahkan huruf kapital')

  // Numbers
  if (/\d/.test(password)) score++
  else suggestions.push('Tambahkan angka')

  // Special characters (bonus)
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const strengthLevels: Record<number, PasswordStrength> = {
    0: {
      score: 0,
      label: 'Lemah',
      color: 'bg-red-500',
      suggestions
    },
    1: {
      score: 1,
      label: 'Lemah',
      color: 'bg-red-500',
      suggestions
    },
    2: {
      score: 2,
      label: 'Cukup',
      color: 'bg-yellow-500',
      suggestions
    },
    3: {
      score: 3,
      label: 'Kuat',
      color: 'bg-blue-500',
      suggestions
    },
    4: {
      score: 4,
      label: 'Sangat Kuat',
      color: 'bg-green-500',
      suggestions: []
    },
    5: {
      score: 5,
      label: 'Sangat Kuat',
      color: 'bg-green-600',
      suggestions: []
    }
  }

  return strengthLevels[Math.min(score, 5)]
}
