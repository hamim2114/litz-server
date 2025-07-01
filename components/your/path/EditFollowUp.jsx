import React, { useEffect, useState } from 'react'
import { Box, TextField, Button, Stack, Autocomplete, Typography, FormControlLabel, Switch, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import useAuth from '../../hook/useAuth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiReq from '../../../utils/axiosReq'
import toast from 'react-hot-toast'
import { CloudUploadOutlined, DeleteOutlined, ImageOutlined } from '@mui/icons-material'
import { uploadFile } from '../../../utils/fileHandler'
import CButton from '../../common/CButton'

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

const EditFollowUp = ({ closeDialog, followUpData }) => {
  const [selectedLink, setSelectedLink] = useState(null)
  const [img, setImg] = useState('')
  const [fileUploadLoading, setFileUploadLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    img: '',
    enabled: false,
    subject: '',
    destinationUrl: '',
    delayInMinutes: 0,
    followUpType: 'casual',
    scheduledTime: '',
    scheduledFrequency: 'daily',
    scheduledDayOfWeek: 0,
  });

  const { token } = useAuth()

  const { data, isLoading } = useQuery({
    queryFn: async () => await apiReq.get('api/link/all', { headers: { Authorization: token } }),
    queryKey: ['links']
  });

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data) => await apiReq.put(`api/follow-up/update/${followUpData._id}`, data, { headers: { Authorization: token } }),
    onSuccess: (res) => {
      toast.success(res.data.message)
      queryClient.invalidateQueries(['follow-ups'])
      closeDialog()
    },
    onError: (err) => {
      setError(err.response.data)
      console.log(err)
    }
  })

  const handleSubmit = async () => {
    if (!selectedLink) {
      setError({ slug: 'Please select a link' })
      return
    }
    if (!formData.subject) {
      setError({ subject: 'Please enter a subject' })
      return
    }
    if (formData.destinationUrl && !formData.destinationUrl.startsWith('http://') && !formData.destinationUrl.startsWith('https://')) {
      setError({ destinationUrl: 'Destination URL must start with https:// or http://' });
      return;
    }
    if (!img && !formData.img) {
      setError({ img: 'Please upload an image' })
      return
    }
    if (img) {
      setFileUploadLoading(true)
      const res = await uploadFile(img)
      setFileUploadLoading(false)
      formData.img = res.secure_url
    }

    let payload = {
      img: formData.img,
      link: selectedLink._id,
      enabled: formData.enabled,
      subject: formData.subject,
      destinationUrl: formData.destinationUrl,
      followUpType: formData.followUpType,
    }

    if (formData.followUpType === 'casual') {
      payload.delayInMinutes = formData.delayInMinutes
    } else if (formData.followUpType === 'scheduled') {
      payload.scheduledTime = formData.scheduledTime
      payload.scheduledFrequency = formData.scheduledFrequency
      if (formData.scheduledFrequency === 'weekly') {
        payload.scheduledDayOfWeek = formData.scheduledDayOfWeek
      }
    }

    mutation.mutate(payload)
  }

  useEffect(() => {
    setFormData({
      img: followUpData.img || '',
      enabled: followUpData.enabled || false,
      subject: followUpData.subject || '',
      destinationUrl: followUpData.destinationUrl || '',
      delayInMinutes: followUpData.delayInMinutes || 0,
      followUpType: followUpData.followUpType || 'casual',
      scheduledTime: followUpData.scheduledTime || '',
      scheduledFrequency: followUpData.scheduledFrequency || 'daily',
      scheduledDayOfWeek: followUpData.scheduledDayOfWeek || 0,
    })
    setSelectedLink(followUpData.link)
  }, [followUpData])

  return (
    <Stack gap={2}>
      {/* Type Selector */}
      <FormControl fullWidth>
        <InputLabel id="followup-type-label">Follow-Up Type</InputLabel>
        <Select
          labelId="followup-type-label"
          value={formData.followUpType}
          label="Follow-Up Type"
          onChange={e => setFormData({ ...formData, followUpType: e.target.value })}
        >
          <MenuItem value="casual">Casual (Delay in Minutes)</MenuItem>
          <MenuItem value="scheduled">Scheduled (Daily/Weekly)</MenuItem>
        </Select>
      </FormControl>

      <Autocomplete
        disabled
        disablePortal
        value={selectedLink}
        loading={isLoading}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        onChange={(e, value) => setSelectedLink(value)}
        options={data?.data || []}
        sx={{ width: '100%' }}
        getOptionLabel={(option) => option.slug}
        renderInput={(params) => <TextField error={!!error?.slug} helperText={error?.slug} {...params} label="Select Slug" />}
        renderOption={(props, option) => (
          <Box {...props}>
            <Typography sx={{ border: '1px solid lightgray', borderRadius: 2, px: 2, py: .5, width: 'fit-content' }}>
              {option.slug}
            </Typography>
          </Box>
        )}
      />
      <TextField
        label="Subject"
        error={!!error?.subject}
        helperText={error?.subject}
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
      />
      <TextField
        label="Destination URL"
        error={!!error?.destinationUrl}
        helperText={error?.destinationUrl}
        value={formData.destinationUrl}
        onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
      />

      {/* Conditional fields */}
      {formData.followUpType === 'casual' && (
        <Box>
          <TextField
            fullWidth
            type="number"
            label="Delay in Minutes"
            error={!!error?.delayInMinutes}
            helperText={error?.delayInMinutes}
            value={formData.delayInMinutes}
            onChange={(e) => setFormData({ ...formData, delayInMinutes: e.target.value })}
          />
          <Typography variant='caption'>
            This will be sent after the delay in minutes (0 is sent immediately)
          </Typography>
        </Box>
      )}

      {formData.followUpType === 'scheduled' && (
        <Stack gap={2}>
          <TextField
            label="Scheduled Time (HH:MM, 24h)"
            placeholder="e.g. 20:00"
            value={formData.scheduledTime}
            onChange={e => setFormData({ ...formData, scheduledTime: e.target.value })}
            error={!!error?.scheduledTime}
            helperText={error?.scheduledTime || 'Time to send the follow-up (e.g. 20:00 for 8pm)'}
          />
          <FormControl fullWidth>
            <InputLabel id="frequency-label">Frequency</InputLabel>
            <Select
              labelId="frequency-label"
              value={formData.scheduledFrequency}
              label="Frequency"
              onChange={e => setFormData({ ...formData, scheduledFrequency: e.target.value })}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
          {formData.scheduledFrequency === 'weekly' && (
            <FormControl fullWidth>
              <InputLabel id="dayofweek-label">Day of Week</InputLabel>
              <Select
                labelId="dayofweek-label"
                value={formData.scheduledDayOfWeek}
                label="Day of Week"
                onChange={e => setFormData({ ...formData, scheduledDayOfWeek: e.target.value })}
              >
                {daysOfWeek.map(day => (
                  <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      )}

      {/* Image upload and preview */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 2,
        border: '2px dashed',
        borderColor: 'primary.main',
        borderRadius: 2,
        position: 'relative'
      }}>
        {formData.img || img ? (
          <>
            <Box
              component="img"
              src={img ? URL.createObjectURL(img) : formData.img}
              alt="profile"
              sx={{
                width: 150,
                height: 150,
                borderRadius: 4,
                objectFit: 'cover'
              }}
            />
            <IconButton
              onClick={() => {
                setImg(null)
                setFormData({ ...formData, img: '' })
              }}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              <DeleteOutlined />
            </IconButton>
          </>
        ) : (
          <Box
            sx={{
              width: 150,
              height: 150,
              borderRadius: 4,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ImageOutlined sx={{ fontSize: 60, color: 'grey.400' }} />
          </Box>
        )}
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadOutlined />}
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImg(e.target.files[0])}
          />
        </Button>
        {error?.img && <Typography variant='caption' color='error'>{error?.img}</Typography>}
      </Box>

      <FormControlLabel
        control={<Switch checked={formData.enabled} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })} />}
        label="Enabled"
      />

      <CButton loading={mutation.isPending || fileUploadLoading} variant="contained" color="primary" onClick={handleSubmit}>Update</CButton>
    </Stack>
  )
}

export default EditFollowUp 