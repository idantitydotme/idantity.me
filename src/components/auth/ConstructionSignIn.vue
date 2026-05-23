<script lang="ts" setup>
import { Card, Form, FormField, Input, Button, Checkbox } from "@rimelight/ui/nuxt"
import { reactive, ref } from "vue"
import { z } from "astro/zod"

const { allowAuth = true } = defineProps<{ allowAuth?: boolean }>()

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  email: "",
  password: "",
  rememberMe: true
})

const isLoading = ref(false)
const error = ref("")

function getRedirectParam(): string {
  if (typeof window === "undefined") return "/"
  const params = new URLSearchParams(window.location.search)
  return params.get("redirect") || "/"
}

async function onSubmit(event: { data: Schema }) {
  isLoading.value = true
  error.value = ""

  const { authClient } = await import("@/auth/auth-client")

  const { error: signInError } = await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: event.data.rememberMe
  })

  isLoading.value = false

  if (signInError) {
    error.value = signInError.message || "Something went wrong"
    return
  }

  window.location.href = getRedirectParam()
}
</script>

<template>
  <template v-if="allowAuth">
    <Card class="bg-black">
      <div class="flex flex-col gap-4">
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <Form :schema="schema" :state="state" @submit="onSubmit">
          <div class="flex flex-col gap-4">
            <FormField
              name="email"
              label="E-mail"
              required
              :ui="{
                label: 'text-white',
                description: 'text-neutral-500'
              }"
            >
              <Input
                v-model="state.email"
                type="email"
                placeholder="your@email.com"
                class="w-full"
              />
            </FormField>

            <FormField
              name="password"
              label="Password"
              required
              :ui="{
                label: 'text-white',
                description: 'text-neutral-500'
              }"
            >
              <Input
                v-model="state.password"
                type="password"
                placeholder="••••••••"
                class="w-full"
              />
            </FormField>

            <Checkbox
              v-model="state.rememberMe"
              name="rememberMe"
              label="Remember me"
              :ui="{
                label: 'text-white',
                indicator: 'data-[state=checked]:bg-primary-500 data-[state=checked]:text-white'
              }"
            />

            <Button
              type="submit"
              color="primary"
              variant="solid"
              block
              :loading="isLoading"
              :disabled="isLoading"
              class="text-white bg-primary-500 hover:bg-primary-600"
            >
              Sign In
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  </template>
  <p v-else class="text-neutral-400">Please return at a later stage.</p>
</template>
