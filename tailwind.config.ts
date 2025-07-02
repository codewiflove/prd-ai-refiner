import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glow: 'hsl(var(--accent-glow))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				lava: {
					primary: 'hsl(var(--lava-primary))',
					secondary: 'hsl(var(--lava-secondary))',
					glow: 'hsl(var(--lava-glow))',
					bright: 'hsl(45 100% 80%)'
				}
			},
			backgroundImage: {
				'gradient-cosmic': 'var(--gradient-cosmic)',
				'gradient-cosmic-subtle': 'var(--gradient-cosmic-subtle)',
				'gradient-glow': 'var(--gradient-glow)',
				'gradient-lava': 'var(--gradient-lava)',
				'gradient-lava-intense': 'var(--gradient-lava-intense)',
				'gradient-lava-animate': 'var(--gradient-lava-animate)',
				'gradient-lava-flow': 'var(--gradient-lava-flow)'
			},
			boxShadow: {
				'cosmic': 'var(--shadow-cosmic)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'lava': 'var(--shadow-lava)',
				'lava-intense': 'var(--shadow-lava-intense)',
				'lava-pulse': 'var(--shadow-lava-pulse)'
			},
			transitionTimingFunction: {
				'cosmic': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-6px)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: 'var(--shadow-cosmic)'
					},
					'50%': {
						boxShadow: 'var(--shadow-glow)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'lava-flow': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				'lava-glow': {
					'0%, 100%': {
						filter: 'brightness(1) saturate(1)',
						boxShadow: 'var(--shadow-lava)'
					},
					'50%': {
						filter: 'brightness(1.2) saturate(1.3)',
						boxShadow: 'var(--shadow-lava-pulse)'
					}
				},
				'lava-bubble': {
					'0%, 100%': {
						transform: 'scale(1) translateY(0px)'
					},
					'25%': {
						transform: 'scale(1.02) translateY(-1px)'
					},
					'50%': {
						transform: 'scale(1.05) translateY(-2px)'
					},
					'75%': {
						transform: 'scale(1.02) translateY(-1px)'
					}
				},
				'lava-particle': {
					'0%': {
						opacity: '0',
						transform: 'translateY(0px) scale(0.8)'
					},
					'25%': {
						opacity: '1',
						transform: 'translateY(-2px) scale(1)'
					},
					'75%': {
						opacity: '1',
						transform: 'translateY(-4px) scale(1.1)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-6px) scale(0.8)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'lava-flow': 'lava-flow 4s ease-in-out infinite',
				'lava-glow': 'lava-glow 2s ease-in-out infinite',
				'lava-bubble': 'lava-bubble 3s ease-in-out infinite',
				'lava-particle': 'lava-particle 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
