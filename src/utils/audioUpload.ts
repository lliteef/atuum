import { supabase } from "@/integrations/supabase/client";

export async function uploadAudioFile(file: File, userId: string) {
  if (file.type !== "audio/wav") {
    throw new Error("Only WAV files are supported");
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { data, error: uploadError } = await supabase.storage
    .from('audio')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    filename: file.name,
    filePath
  };
}