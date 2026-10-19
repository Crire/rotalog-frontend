
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

type AccountType = "buyer" | "supplier";

type RegisterForm = {
    name: string;
    companyName: string;
    cnpj: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

const initialForm: RegisterForm = {
    name: "",
    companyName: "",
    cnpj: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

export function Register() {
    const [accountType, setAccountType] =
        useState<AccountType>("buyer");

    const [form, setForm] = useState<RegisterForm>(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function updateField(field: keyof RegisterForm, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setError("");
        setMessage("");
    }

    function changeAccountType(type: AccountType) {
        setAccountType(type);
        setForm(initialForm);
        setError("");
        setMessage("");
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (form.password.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("As senhas informadas não coincidem.");
            return;
        }

        if (accountType === "supplier") {
            const digits = form.cnpj.replace(/\D/g, "");

            if (digits.length !== 14) {
                setError("Informe um CNPJ com 14 dígitos.");
                return;
            }
        }

        setError("");
        setMessage(
            "Formulário validado. O cadastro será integrado à API do RotaLog."
        );
    }

    const inputClass =
        "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

    const labelClass =
        "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600";

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="grid min-h-screen lg:grid-cols-2">
                <section className="flex flex-col bg-white px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
                    <Link to="/" className="flex w-fit items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-6 w-6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                                <path d="m3 12 9 5 9-5" />
                                <path d="m3 16 9 5 9-5" />
                            </svg>
                        </span>

                        <span>
                            <span className="block text-xl font-extrabold tracking-tight">
                                RotaLog
                            </span>
                            <span className="block text-[10px] text-slate-500">
                                Conectando negócios. Entregando mais.
                            </span>
                        </span>
                    </Link>

                    <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-10 lg:py-12">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Crie sua conta
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Faça parte da plataforma RotaLog.
                        </p>

                        <div
                            className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1"
                            aria-label="Tipo de conta"
                        >
                            <button
                                type="button"
                                onClick={() => changeAccountType("buyer")}
                                aria-pressed={accountType === "buyer"}
                                className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${accountType === "buyer"
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                Comprador
                            </button>

                            <button
                                type="button"
                                onClick={() => changeAccountType("supplier")}
                                aria-pressed={accountType === "supplier"}
                                className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${accountType === "supplier"
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                    }`}
                            >
                                Fornecedor
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                            {accountType === "supplier" && (
                                <>
                                    <div>
                                        <label htmlFor="companyName" className={labelClass}>
                                            Razão social
                                        </label>
                                        <input
                                            id="companyName"
                                            required
                                            value={form.companyName}
                                            onChange={(event) =>
                                                updateField("companyName", event.target.value)
                                            }
                                            placeholder="Nome da empresa"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="cnpj" className={labelClass}>
                                            CNPJ
                                        </label>
                                        <input
                                            id="cnpj"
                                            required
                                            inputMode="numeric"
                                            maxLength={18}
                                            value={form.cnpj}
                                            onChange={(event) =>
                                                updateField("cnpj", event.target.value)
                                            }
                                            placeholder="00.000.000/0000-00"
                                            className={inputClass}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label htmlFor="name" className={labelClass}>
                                    {accountType === "buyer"
                                        ? "Nome completo"
                                        : "Nome do responsável"}
                                </label>
                                <input
                                    id="name"
                                    required
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={(event) =>
                                        updateField("name", event.target.value)
                                    }
                                    placeholder="Digite seu nome"
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="email" className={labelClass}>
                                        E-mail
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={(event) =>
                                            updateField("email", event.target.value)
                                        }
                                        placeholder="seu@email.com"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className={labelClass}>
                                        Telefone
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        required
                                        autoComplete="tel"
                                        value={form.phone}
                                        onChange={(event) =>
                                            updateField("phone", event.target.value)
                                        }
                                        placeholder="(00) 00000-0000"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="password" className={labelClass}>
                                        Senha
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
                                        className="text-xs font-semibold text-blue-600"
                                    >
                                        {showPassword ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(event) =>
                                        updateField("password", event.target.value)
                                    }
                                    placeholder="Mínimo de 8 caracteres"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className={labelClass}>
                                    Confirmar senha
                                </label>
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={(event) =>
                                        updateField("confirmPassword", event.target.value)
                                    }
                                    placeholder="Repita sua senha"
                                    className={inputClass}
                                />
                            </div>

                            {error && (
                                <p role="alert" className="text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            {message && (
                                <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Criar conta
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-slate-500">
                            Já possui uma conta?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                Fazer login
                            </Link>
                        </p>
                    </div>

                    <footer className="text-center text-xs text-slate-400 sm:text-left">
                        © 2026 RotaLog Sistemas de Logística S.A.
                    </footer>
                </section>

                <aside className="relative hidden min-h-full overflow-hidden bg-[#101b38] text-white lg:block">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: "url('/images/login-truck.png')",
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-[#1b3260]/85 via-[#101b38]/80 to-[#050a1b]/95" />

                    <div className="relative flex h-full flex-col px-10 py-6 xl:px-12">
                        <div>
                            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100">
                                ● Plataforma Integrada
                            </span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                            <h2 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
                                Conecte seu negócio a novas oportunidades.
                            </h2>

                            <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                                Compre de diferentes fornecedores ou gerencie seus
                                produtos e pedidos em uma única plataforma.
                            </p>

                            <div className="mt-8 space-y-4">
                                {[
                                    "Mais eficiência",
                                    "Mais oportunidades",
                                    "Mais resultados",
                                ].map((benefit) => (
                                    <div
                                        key={benefit}
                                        className="flex items-center gap-3 text-sm font-medium"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs">
                                            ✓
                                        </span>
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <footer className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-300">
                            <span>RotaLog Cloud</span>
                            <span>Plataforma integrada</span>
                        </footer>
                    </div>
                </aside>
            </div>
        </div>
    );
}
