import { type Component, createSignal } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import { RLPageSection, RLCard, RLButton } from "@rimelight/ui"
import Turnstile from "#components/Turnstile"
import { t } from "@rimelight/i18n"
import { api } from "#api/client"

export const ContactPage: Component = () => {
  const [contactStatus, setContactStatus] = createSignal<{ text: string; error?: boolean } | null>(
    null
  )
  const [uploadStatus, setUploadStatus] = createSignal<{ text: string; error?: boolean } | null>(
    null
  )

  let contactFormRef!: HTMLFormElement
  let uploadFormRef!: HTMLFormElement

  const handleContactSubmit = async (e: Event) => {
    e.preventDefault()
    if (!contactFormRef) return

    setContactStatus({ text: "Sending message..." })

    try {
      const res = await api.contact.$post({
        form: new FormData(contactFormRef) as any
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        const errorMsg =
          !result.success && "error" in result
            ? (result as any).error
            : "Please check form fields and try again."
        setContactStatus({
          text: errorMsg || "Please check form fields and try again.",
          error: true
        })
        return
      }

      setContactStatus({ text: "Message sent successfully! ✅", error: false })
      contactFormRef.reset()
      // @ts-ignore
      window.turnstile?.reset?.()
    } catch {
      setContactStatus({ text: "Failed to send message. Please try again.", error: true })
    }
  }

  const handleUploadSubmit = async (e: Event) => {
    e.preventDefault()
    if (!uploadFormRef) return

    setUploadStatus({ text: "Uploading file..." })

    try {
      const res = await api.upload.$post({
        form: new FormData(uploadFormRef) as any
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        const errorMsg =
          !result.success && "error" in result ? (result as any).error : "Failed to upload file."
        setUploadStatus({ text: errorMsg || "Failed to upload file.", error: true })
        return
      }

      setUploadStatus({ text: `File uploaded! Key: ${result.key} ✅`, error: false })
      uploadFormRef.reset()
    } catch {
      setUploadStatus({ text: "Failed to upload file.", error: true })
    }
  }

  return (
    <AppLayout title={t("page_contact.title")} description={t("page_contact.description")}>
      <RLPageSection
        variant="hero"
        title={t("page_contact.hero_title")}
        description={t("page_contact.hero_description")}
        orientation="horizontal"
      />

      <RLPageSection
        orientation="vertical"
        body={
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-xl max-w-6xl mx-auto w-full">
            {/* Contact Form Card */}
            <RLCard class="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h2 class="text-2xl font-bold text-[var(--rl-text)] mb-6 flex items-center gap-2">
                  <span class="i-lucide-mail size-6 text-primary-500" />
                  {t("page_contact.contact_form_title")}
                </h2>

                <form
                  ref={(el) => (contactFormRef = el)}
                  onSubmit={handleContactSubmit}
                  class="flex flex-col gap-4"
                >
                  <div class="flex flex-col gap-1">
                    <label
                      for="contact-name"
                      class="text-sm font-medium text-[var(--rl-text-muted)]"
                    >
                      {t("page_contact.contact_form_name_label")}
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder={t("page_contact.contact_form_placeholder_name")}
                      class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-default text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label
                      for="contact-email"
                      class="text-sm font-medium text-[var(--rl-text-muted)]"
                    >
                      {t("page_contact.contact_form_email_label")}
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder={t("page_contact.contact_form_placeholder_email")}
                      class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-default text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label
                      for="contact-subject"
                      class="text-sm font-medium text-[var(--rl-text-muted)]"
                    >
                      {t("page_contact.contact_form_subject_label")}
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      placeholder={t("page_contact.contact_form_placeholder_subject")}
                      class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-default text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label
                      for="contact-message"
                      class="text-sm font-medium text-[var(--rl-text-muted)]"
                    >
                      {t("page_contact.contact_form_message_label")}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      placeholder={t("page_contact.contact_form_placeholder_message")}
                      class="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-default text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-y min-h-[120px]"
                    />
                  </div>

                  <Turnstile />

                  <RLButton
                    type="submit"
                    color="primary"
                    variant="solid"
                    block={true}
                    leadingIcon="i-lucide-send"
                    label={t("page_contact.contact_form_send_button")}
                    class="mt-2"
                  />

                  {contactStatus() && (
                    <p
                      class={`text-sm min-h-[1.5rem] mt-2 font-medium ${
                        contactStatus()?.error
                          ? "text-red-500"
                          : contactStatus()?.text.includes("✅")
                            ? "text-green-600 dark:text-green-400"
                            : "text-neutral-500"
                      }`}
                      role="status"
                    >
                      {contactStatus()?.text}
                    </p>
                  )}
                </form>
              </div>
            </RLCard>

            {/* File Upload Card */}
            <RLCard class="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h2 class="text-2xl font-bold text-[var(--rl-text)] mb-2 flex items-center gap-2">
                  <span class="i-lucide-upload-cloud size-6 text-primary-500" />
                  {t("page_contact.upload_form_title")}
                </h2>
                <p class="text-sm text-[var(--rl-text-muted)] mb-6">
                  {t("page_contact.upload_form_description")}
                </p>

                <form
                  ref={(el) => (uploadFormRef = el)}
                  onSubmit={handleUploadSubmit}
                  class="flex flex-col gap-4"
                >
                  <div class="flex flex-col gap-1">
                    <label
                      for="upload-file"
                      class="text-sm font-medium text-[var(--rl-text-muted)]"
                    >
                      {t("page_contact.upload_form_file_label")}
                    </label>
                    <input
                      id="upload-file"
                      name="file"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      required
                      class="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-default text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 cursor-pointer"
                    />
                  </div>

                  <RLButton
                    type="submit"
                    color="primary"
                    variant="outline"
                    block={true}
                    leadingIcon="i-lucide-upload"
                    label={t("page_contact.upload_form_upload_button")}
                    class="mt-4"
                  />

                  {uploadStatus() && (
                    <p
                      class={`text-sm min-h-[1.5rem] mt-2 font-medium ${
                        uploadStatus()?.error
                          ? "text-red-500"
                          : uploadStatus()?.text.includes("✅")
                            ? "text-green-600 dark:text-green-400"
                            : "text-neutral-500"
                      }`}
                      role="status"
                    >
                      {uploadStatus()?.text}
                    </p>
                  )}
                </form>
              </div>
            </RLCard>
          </div>
        }
      />
    </AppLayout>
  )
}

export default ContactPage
